import { customAlphabet } from "nanoid";

const generateSlug = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 8);

export function createQrCodeSlug() {
  return generateSlug();
}

export function qrPublicUrl(code: string) {
  const base = (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}/r/${code}`;
}
