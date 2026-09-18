import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/auth";

export async function requireAdmin() {
  const store = await cookies();
  const payload = await verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
  if (!payload) {
    redirect("/login");
  }
  return payload;
}
