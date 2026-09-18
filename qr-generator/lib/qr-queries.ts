import type { QrStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export type QrListFilters = {
  status?: QrStatus | "all";
  client?: string;
  from?: string;
  to?: string;
};

export async function listQrs(filters: QrListFilters = {}) {
  await requireAdmin();
  const client = filters.client?.trim();
  const createdAt = dateRange(filters.from, filters.to);

  return prisma.qrCode.findMany({
    where: {
      deletedAt: null,
      ...(filters.status && filters.status !== "all" ? { status: filters.status } : {}),
      ...(client ? { clientName: { contains: client } } : {}),
      ...(createdAt ? { createdAt } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

function dateRange(from?: string, to?: string) {
  const start = parseDay(from, false);
  const end = parseDay(to, true);
  if (!start && !end) {
    return undefined;
  }
  return {
    ...(start ? { gte: start } : {}),
    ...(end ? { lte: end } : {}),
  };
}

function parseDay(value: string | undefined, endOfDay: boolean) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00"}-03:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
