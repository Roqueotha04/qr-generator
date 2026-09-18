"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { QrStatus } from "@prisma/client";
import { updateQr } from "@/app/actions/qrs";
import type { QrDto } from "@/lib/qr-dto";
import { QR_STATUS_LABELS, QR_STATUSES } from "@/lib/qr-status";
import { QrPlate } from "./qr-plate";

type InventoryPanelProps = {
  qrs: QrDto[];
  filters: { status: QrStatus | "all"; client: string; from: string; to: string };
  publicBase: string;
};

export function InventoryPanel({ qrs, filters, publicBase }: InventoryPanelProps) {
  const counts = useMemo(() => {
    return {
      total: qrs.length,
      unused: qrs.filter((qr) => qr.status === "unused").length,
      scans: qrs.reduce((sum, qr) => sum + qr.scanCount, 0),
    };
  }, [qrs]);

  return (
    <main className="px-4 py-6 md:px-6">
      <header className="flex flex-col gap-4 border-b border-rule pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Inventario</h1>
          <p className="mt-1 text-sm text-muted">Filtrá el stock y editá destino, cliente o estado.</p>
        </div>
        <div className="flex flex-wrap items-end gap-5">
          <Stat label="En esta lista" value={String(counts.total)} />
          <Stat label="Sin usar" value={String(counts.unused)} />
          <Stat label="Escaneos" value={String(counts.scans)} accent />
        </div>
      </header>

      <div className="mt-4 border border-rule bg-panel p-3">
        <FilterBar filters={filters} />
      </div>

      {qrs.length === 0 ? (
        <p className="mt-10 max-w-md text-sm text-muted">
          No hay QRs con esos filtros. Generá un lote o ampliá el rango de fechas.
        </p>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {qrs.map((qr) => (
            <li key={qr.id}>
              <QrEditor qr={qr} publicUrl={`${publicBase.replace(/\/$/, "")}/r/${qr.code}`} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-muted">{label}</p>
      <p className={`font-mono text-xl ${accent ? "text-cyan" : "text-paper"}`}>{value}</p>
    </div>
  );
}

function FilterBar({ filters }: { filters: InventoryPanelProps["filters"] }) {
  return (
    <form method="get" className="grid grid-cols-2 gap-2 md:grid-cols-6 md:items-end">
      <label className="flex flex-col gap-1 text-[11px] text-muted">
        Estado
        <select
          name="status"
          defaultValue={filters.status}
          className="border border-rule bg-floor px-2 py-1.5 text-sm text-paper"
        >
          <option value="all">Todos</option>
          {QR_STATUSES.map((status) => (
            <option key={status} value={status}>
              {QR_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-[11px] text-muted md:col-span-2">
        Cliente
        <input
          name="client"
          defaultValue={filters.client}
          placeholder="Nombre del negocio"
          className="border border-rule bg-floor px-2 py-1.5 text-sm text-paper"
        />
      </label>
      <label className="flex flex-col gap-1 text-[11px] text-muted">
        Desde
        <input
          type="date"
          name="from"
          defaultValue={filters.from}
          className="border border-rule bg-floor px-2 py-1.5 text-sm text-paper"
        />
      </label>
      <label className="flex flex-col gap-1 text-[11px] text-muted">
        Hasta
        <input
          type="date"
          name="to"
          defaultValue={filters.to}
          className="border border-rule bg-floor px-2 py-1.5 text-sm text-paper"
        />
      </label>
      <button type="submit" className="border border-rule px-3 py-1.5 text-sm hover:border-cyan">
        Filtrar
      </button>
    </form>
  );
}

function QrEditor({ qr, publicUrl }: { qr: QrDto; publicUrl: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const created = new Date(qr.createdAt).toLocaleDateString("es-AR");

  return (
    <article className="border border-rule bg-panel">
      <QrPlate code={qr.code} publicUrl={publicUrl} />
      <form
        className="flex flex-col gap-1.5 p-2"
        action={(formData) => {
          startTransition(async () => {
            const result = await updateQr({
              id: qr.id,
              destinationUrl: String(formData.get("destinationUrl") ?? ""),
              clientName: String(formData.get("clientName") ?? ""),
              status: String(formData.get("status") ?? qr.status),
            });
            setMessage(result.ok ? "Guardado" : result.error);
            if (result.ok) router.refresh();
          });
        }}
      >
        <label className="flex flex-col gap-0.5 text-[10px] text-muted">
          Estado
          <select
            name="status"
            defaultValue={qr.status}
            className="border border-rule bg-floor px-1.5 py-1 text-xs text-paper"
          >
            {QR_STATUSES.map((status) => (
              <option key={status} value={status}>
                {QR_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-0.5 text-[10px] text-muted">
          Cliente
          <input
            name="clientName"
            defaultValue={qr.clientName ?? ""}
            placeholder="Pizzería Sur"
            className="border border-rule bg-floor px-1.5 py-1 text-xs text-paper"
          />
        </label>
        <label className="flex flex-col gap-0.5 text-[10px] text-muted">
          Link
          <input
            name="destinationUrl"
            defaultValue={qr.destinationUrl ?? ""}
            placeholder="https://maps.google.com/..."
            className="border border-rule bg-floor px-1.5 py-1 text-xs text-paper"
          />
        </label>
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[10px] text-cyan">{qr.scanCount} ingresos</p>
          <p className="text-[10px] text-muted">{created}</p>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="border border-cyan px-2 py-1 text-xs text-cyan disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar"}
        </button>
        {message ? <p className="text-[10px] text-muted">{message}</p> : null}
      </form>
    </article>
  );
}
