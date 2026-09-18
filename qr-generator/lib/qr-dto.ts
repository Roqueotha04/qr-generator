import type { QrCode, QrStatus } from "@prisma/client";

export type QrDto = {
  id: string;
  code: string;
  destinationUrl: string | null;
  clientName: string | null;
  status: QrStatus;
  scanCount: number;
  lastScannedAt: string | null;
  createdAt: string;
};

export function toQrDto(qr: QrCode): QrDto {
  return {
    id: qr.id,
    code: qr.code,
    destinationUrl: qr.destinationUrl,
    clientName: qr.clientName,
    status: qr.status,
    scanCount: qr.scanCount,
    lastScannedAt: qr.lastScannedAt?.toISOString() ?? null,
    createdAt: qr.createdAt.toISOString(),
  };
}
