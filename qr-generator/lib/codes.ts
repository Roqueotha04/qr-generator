import { customAlphabet } from "nanoid";

export const QR_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export const QR_CODE_LENGTH = 8;
export const QR_CODE_PATTERN = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/;

const generateSlug = customAlphabet(QR_CODE_ALPHABET, QR_CODE_LENGTH);

export function createQrCodeSlug() {
  return generateSlug();
}

export function isQrCodeSlug(value: string) {
  return QR_CODE_PATTERN.test(value);
}

export function qrPublicUrl(code: string, baseUrl?: string) {
  const base = (baseUrl ?? process.env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}/r/${code}`;
}

export function isLocalAppBase(baseUrl?: string) {
  const base = baseUrl ?? process.env.APP_BASE_URL ?? "http://localhost:3000";
  try {
    const host = new URL(base).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return true;
  }
}
