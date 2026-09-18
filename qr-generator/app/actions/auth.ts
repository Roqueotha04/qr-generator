"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, JWT_MAX_AGE_SECONDS, passwordsMatch, signAdminToken } from "@/lib/auth";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD ?? "";

  if (!expected || !passwordsMatch(password, expected)) {
    redirect("/login?error=1");
  }

  if (!process.env.AUTH_SECRET) {
    redirect("/login?error=1");
  }

  const token = await signAdminToken();
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: JWT_MAX_AGE_SECONDS,
  });

  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/login");
}
