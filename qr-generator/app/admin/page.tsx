import type { QrStatus } from "@prisma/client";
import { toQrDto } from "@/lib/qr-dto";
import { listQrs } from "@/lib/qr-queries";
import { isQrStatus } from "@/lib/qr-status";
import { InventoryPanel } from "./inventory-panel";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; client?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const rawStatus = params.status ?? "";
  const status: QrStatus | "all" = isQrStatus(rawStatus) ? rawStatus : "all";
  const client = params.client ?? "";
  const from = params.from ?? "";
  const to = params.to ?? "";
  const qrs = await listQrs({ status, client, from, to });
  const publicBase = process.env.APP_BASE_URL ?? "http://localhost:3000";

  return (
    <InventoryPanel
      qrs={qrs.map(toQrDto)}
      filters={{ status, client, from, to }}
      publicBase={publicBase}
    />
  );
}
