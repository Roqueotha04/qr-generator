import { isQrStatus } from "@/lib/qr-status";
import type { QrStatus } from "@prisma/client";

export const MAX_BATCH = 50;
export const MAX_CLIENT_NAME = 255;
export const MAX_DESTINATION_URL = 2048;

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

export function parseBatchCount(value: unknown): ParseResult<number> {
  if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
    return fail("Indicá una cantidad entre 1 y 50");
  }

  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > MAX_BATCH) {
    return fail("Indicá una cantidad entre 1 y 50");
  }

  return { ok: true, value: n };
}

export function parseOptionalHttpUrl(value: unknown): ParseResult<string | null> {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) {
    return { ok: true, value: null };
  }
  if (raw.length > MAX_DESTINATION_URL) {
    return fail("El link es demasiado largo");
  }
  if (!isHttpUrl(raw)) {
    return fail("El link tiene que empezar con http:// o https://");
  }
  return { ok: true, value: raw };
}

export function parseOptionalClientName(value: unknown): ParseResult<string | null> {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) {
    return { ok: true, value: null };
  }
  if (raw.length > MAX_CLIENT_NAME) {
    return fail("El nombre del cliente es demasiado largo");
  }
  return { ok: true, value: raw };
}

export function parseRequiredId(value: unknown): ParseResult<string> {
  const id = typeof value === "string" ? value.trim() : "";
  if (!id) {
    return fail("QR no válido");
  }
  return { ok: true, value: id };
}

export function parseOptionalStatus(value: unknown): ParseResult<QrStatus | undefined> {
  if (value === undefined || value === null || value === "") {
    return { ok: true, value: undefined };
  }
  if (typeof value !== "string" || !isQrStatus(value)) {
    return fail("Estado no válido");
  }
  return { ok: true, value };
}

export function parseCreateQrInput(input: {
  count?: unknown;
  destinationUrl?: unknown;
  clientName?: unknown;
  status?: unknown;
}) {
  const count = parseBatchCount(input.count);
  if (!count.ok) return count;

  const destinationUrl = parseOptionalHttpUrl(input.destinationUrl);
  if (!destinationUrl.ok) return destinationUrl;

  const clientName = parseOptionalClientName(input.clientName);
  if (!clientName.ok) return clientName;

  const status = parseOptionalStatus(input.status);
  if (!status.ok) return status;

  return {
    ok: true as const,
    value: {
      count: count.value,
      destinationUrl: destinationUrl.value,
      clientName: clientName.value,
      status: status.value ?? "unused",
    },
  };
}

export function parseUpdateQrInput(input: {
  id?: unknown;
  destinationUrl?: unknown;
  clientName?: unknown;
  status?: unknown;
}) {
  const id = parseRequiredId(input.id);
  if (!id.ok) return id;

  const destinationUrl = parseOptionalHttpUrl(input.destinationUrl);
  if (!destinationUrl.ok) return destinationUrl;

  const clientName = parseOptionalClientName(input.clientName);
  if (!clientName.ok) return clientName;

  const status = parseOptionalStatus(input.status);
  if (!status.ok) return status;

  return {
    ok: true as const,
    value: {
      id: id.value,
      destinationUrl: destinationUrl.value,
      clientName: clientName.value,
      status: status.value,
    },
  };
}

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}
