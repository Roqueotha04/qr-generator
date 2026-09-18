import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE = "qr_admin";
export const JWT_MAX_AGE_SECONDS = 60 * 60 * 8;
const JWT_EXPIRES = "8h";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function signAdminToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES)
    .sign(getSecret());
}

export async function verifyAdminToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    if (payload.sub !== "admin") {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function isValidSession(cookieValue: string | undefined) {
  if (!process.env.AUTH_SECRET) {
    return false;
  }
  return (await verifyAdminToken(cookieValue)) !== null;
}

export function passwordsMatch(provided: string, expected: string) {
  if (!expected || provided.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(provided, expected);
}

function timingSafeEqual(a: string, b: string) {
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
