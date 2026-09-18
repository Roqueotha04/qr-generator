import type { QrStatus } from "@prisma/client";

type QrGuard = {
  status: QrStatus;
  scanCount: number;
  deletedAt?: Date | null;
};

export function canVoidQr(qr: QrGuard) {
  return !qr.deletedAt && qr.status === "unused" && qr.scanCount === 0;
}

export function canChangeStatus(current: QrStatus, next: QrStatus) {
  if (current === next) {
    return true;
  }
  return current !== "sold";
}
