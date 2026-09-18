"use server";

import { revalidatePath } from "next/cache";
import type { QrStatus } from "@prisma/client";
import { createQrCodeSlug } from "@/lib/codes";
import { prisma } from "@/lib/prisma";
import { isQrStatus } from "@/lib/qr-status";
import { requireAdmin } from "@/lib/require-admin";

const MAX_BATCH = 50;

export type QrListFilters = {
  status?: QrStatus | "all";
  client?: string;
  from?: string;
  to?: string;
};

export async function listQrs(filters: QrListFilters = {}) {
  await requireAdmin();
  const client = filters.client?.trim();
  const createdAt = dateRange(filters.from, filters.to);

  return prisma.qrCode.findMany({
    where: {
      ...(filters.status && filters.status !== "all" ? { status: filters.status } : {}),
      ...(client ? { clientName: { contains: client } } : {}),
      ...(createdAt ? { createdAt } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createQrs(input: {
  count?: number;
  destinationUrl?: string;
  clientName?: string;
  status?: string;
} = {}) {
  await requireAdmin();

  const size = Number.isFinite(input.count)
    ? Math.min(MAX_BATCH, Math.max(1, Math.floor(input.count ?? 1)))
    : 1;
  const destinationUrl = input.destinationUrl?.trim() ?? "";
  const clientName = input.clientName?.trim() ?? "";

  if (destinationUrl && !isHttpUrl(destinationUrl)) {
    return { ok: false as const, error: "El link tiene que empezar con http:// o https://" };
  }

  if (input.status && !isQrStatus(input.status)) {
    return { ok: false as const, error: "Estado no válido" };
  }

  const created = [];

  for (let i = 0; i < size; i += 1) {
    let lastError: unknown;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const qr = await prisma.qrCode.create({
          data: {
            code: createQrCodeSlug(),
            destinationUrl: destinationUrl || null,
            clientName: clientName || null,
            status: input.status && isQrStatus(input.status) ? input.status : "unused",
          },
        });
        created.push(qr);
        lastError = undefined;
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (lastError) {
      throw lastError;
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/generar");
  return { ok: true as const, count: created.length };
}

export async function updateQr(input: {
  id: string;
  destinationUrl?: string;
  clientName?: string;
  status?: string;
}) {
  await requireAdmin();

  const destinationUrl = input.destinationUrl?.trim() ?? "";
  const clientName = input.clientName?.trim() ?? "";

  if (destinationUrl && !isHttpUrl(destinationUrl)) {
    return { ok: false as const, error: "El link tiene que empezar con http:// o https://" };
  }

  if (input.status && !isQrStatus(input.status)) {
    return { ok: false as const, error: "Estado no válido" };
  }

  await prisma.qrCode.update({
    where: { id: input.id },
    data: {
      destinationUrl: destinationUrl || null,
      clientName: clientName || null,
      ...(input.status && isQrStatus(input.status) ? { status: input.status } : {}),
    },
  });

  revalidatePath("/admin");
  return { ok: true as const };
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function dateRange(from?: string, to?: string) {
  const start = parseDay(from, false);
  const end = parseDay(to, true);
  if (!start && !end) {
    return undefined;
  }
  return {
    ...(start ? { gte: start } : {}),
    ...(end ? { lte: end } : {}),
  };
}

function parseDay(value: string | undefined, endOfDay: boolean) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00"}`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
