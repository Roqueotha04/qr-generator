"use client";

import { useState, useTransition } from "react";
import { createQrs } from "@/app/actions/qrs";
import { QR_STATUS_LABELS, QR_STATUSES } from "@/lib/qr-status";

type GeneratePanelProps = {
  publicBase: string;
  warnLocalBase: boolean;
};

export function GeneratePanel({ publicBase, warnLocalBase }: GeneratePanelProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="px-4 py-6 md:px-6">
      <header className="border-b border-rule pb-4">
        <h1 className="text-3xl font-semibold tracking-tight">Generar QRs</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">
          El lote nace con estos datos. El link puede quedar vacío: la tarjeta queda lista y el destino se carga después.
        </p>
        {warnLocalBase ? (
          <p className="mt-4 max-w-xl border border-press/40 bg-press/10 px-3 py-2 text-sm text-paper">
            APP_BASE_URL es local ({publicBase}). Estos QRs no van a funcionar en un celular fuera de esta PC. No los mandes a imprimir.
          </p>
        ) : null}
      </header>

      <form
        className="mt-6 max-w-lg border border-rule bg-panel p-5"
        action={(formData) => {
          setMessage(null);
          setError(null);
          startTransition(async () => {
            try {
              const result = await createQrs({
                count: formData.get("count"),
                clientName: formData.get("clientName"),
                destinationUrl: formData.get("destinationUrl"),
                status: formData.get("status"),
              });
              if (result.ok) {
                setMessage(`Se generaron ${result.count} QR${result.count === 1 ? "" : "s"}.`);
              } else {
                setError(result.error);
              }
            } catch {
              setError("No se pudo generar el lote. Probá de nuevo.");
            }
          });
        }}
      >
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs text-muted">
            Cantidad
            <input
              name="count"
              type="number"
              min={1}
              max={50}
              defaultValue={1}
              required
              className="border border-rule bg-floor px-3 py-2 text-sm text-paper"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Cliente
            <input
              name="clientName"
              placeholder="Pizzería Sur"
              className="border border-rule bg-floor px-3 py-2 text-sm text-paper"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Link de destino
            <input
              name="destinationUrl"
              placeholder="https://maps.google.com/..."
              className="border border-rule bg-floor px-3 py-2 text-sm text-paper"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Estado inicial
            <select
              name="status"
              defaultValue="unused"
              className="border border-rule bg-floor px-3 py-2 text-sm text-paper"
            >
              {QR_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {QR_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={pending}
            className="bg-press px-4 py-2.5 text-sm font-medium text-paper disabled:opacity-60"
          >
            {pending ? "Generando..." : "Generar lote"}
          </button>
          {message ? <p className="text-sm text-cyan">{message}</p> : null}
          {error ? <p className="text-sm text-press">{error}</p> : null}
        </div>
      </form>
    </main>
  );
}
