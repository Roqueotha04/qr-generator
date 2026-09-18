"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createQrCodeSlug } from "@/lib/codes";
import { prisma } from "@/lib/prisma";
import { canChangeStatus, canVoidQr } from "@/lib/qr-rules";
import { parseCreateQrInput, parseRequiredId, parseUpdateQrInput } from "@/lib/qr-validation";
import { requireAdmin } from "@/lib/require-admin";

const ALLOC_ROUNDS = 8;
const UNIQUE_RETRIES = 5;

export async function createQrs(input: {
  count?: unknown;
  destinationUrl?: unknown;
  clientName?: unknown;
  status?: unknown;
} = {}) {
  await requireAdmin();

  const parsed = parseCreateQrInput(input);
  if (!parsed.ok) {
    return parsed;
  }

  const { count, destinationUrl, clientName, status } = parsed.value;

  try {
    const created = await insertBatch({ count, destinationUrl, clientName, status });
    revalidatePath("/admin");
    revalidatePath("/admin/generar");
    return { ok: true as const, count: created };
  } catch {
    return { ok: false as const, error: "No se pudo generar el lote. Probá de nuevo." };
  }
}

export async function updateQr(input: {
  id?: unknown;
  destinationUrl?: unknown;
  clientName?: unknown;
  status?: unknown;
}) {
  await requireAdmin();

  const parsed = parseUpdateQrInput(input);
  if (!parsed.ok) {
    return parsed;
  }

  const qr = await prisma.qrCode.findFirst({
    where: { id: parsed.value.id, deletedAt: null },
  });

  if (!qr) {
    return { ok: false as const, error: "Este QR ya no está disponible" };
  }

  if (parsed.value.status && !canChangeStatus(qr.status, parsed.value.status)) {
    return { ok: false as const, error: "Un QR vendido no puede volver a stock" };
  }

  try {
    await prisma.qrCode.update({
      where: { id: qr.id },
      data: {
        destinationUrl: parsed.value.destinationUrl,
        clientName: parsed.value.clientName,
        ...(parsed.value.status && canChangeStatus(qr.status, parsed.value.status)
          ? { status: parsed.value.status }
          : {}),
      },
    });
  } catch (error) {
    if (isMissingRecord(error)) {
      return { ok: false as const, error: "Este QR ya no está disponible" };
    }
    return { ok: false as const, error: "No se pudo guardar. Probá de nuevo." };
  }

  revalidatePath("/admin");
  return { ok: true as const };
}

export async function voidQr(input: { id?: unknown }) {
  await requireAdmin();

  const id = parseRequiredId(input.id);
  if (!id.ok) {
    return id;
  }

  const qr = await prisma.qrCode.findFirst({
    where: { id: id.value, deletedAt: null },
  });

  if (!qr) {
    return { ok: false as const, error: "Este QR ya no está disponible" };
  }

  if (!canVoidQr(qr)) {
    return { ok: false as const, error: "Este QR no se puede anular" };
  }

  try {
    await prisma.qrCode.update({
      where: { id: qr.id },
      data: { deletedAt: new Date() },
    });
  } catch (error) {
    if (isMissingRecord(error)) {
      return { ok: false as const, error: "Este QR ya no está disponible" };
    }
    return { ok: false as const, error: "No se pudo anular. Probá de nuevo." };
  }

  revalidatePath("/admin");
  return { ok: true as const };
}

async function insertBatch(input: {
  count: number;
  destinationUrl: string | null;
  clientName: string | null;
  status: "unused" | "in_process" | "sold";
}) {
  for (let attempt = 0; attempt < UNIQUE_RETRIES; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const codes = await allocateUniqueCodes(tx, input.count);
        await tx.qrCode.createMany({
          data: codes.map((code) => ({
            code,
            destinationUrl: input.destinationUrl,
            clientName: input.clientName,
            status: input.status,
          })),
        });
        return codes.length;
      });
    } catch (error) {
      if (isUniqueConflict(error) && attempt < UNIQUE_RETRIES - 1) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("QR_BATCH_FAILED");
}

async function allocateUniqueCodes(
  tx: Prisma.TransactionClient,
  size: number,
) {
  const codes = new Set<string>();

  for (let round = 0; round < ALLOC_ROUNDS && codes.size < size; round += 1) {
    while (codes.size < size) {
      codes.add(createQrCodeSlug());
    }

    const existing = await tx.qrCode.findMany({
      where: { code: { in: [...codes] } },
      select: { code: true },
    });

    for (const row of existing) {
      codes.delete(row.code);
    }
  }

  if (codes.size < size) {
    throw new Error("QR_CODE_ALLOCATION_FAILED");
  }

  return [...codes];
}

function isUniqueConflict(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function isMissingRecord(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}
