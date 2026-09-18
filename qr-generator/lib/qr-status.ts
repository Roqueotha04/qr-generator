import type { QrStatus } from "@prisma/client";

export const QR_STATUS_LABELS: Record<QrStatus, string> = {
  unused: "Sin usar",
  in_process: "En proceso",
  sold: "Vendido",
};

export const QR_STATUSES = ["unused", "in_process", "sold"] as const satisfies readonly QrStatus[];

export function isQrStatus(value: string): value is QrStatus {
  return (QR_STATUSES as readonly string[]).includes(value);
}
