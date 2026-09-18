export default function UnconfiguredPage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-6">
      <div className="w-full max-w-md border border-rule bg-panel p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">
          QR sin destino
        </p>
        <h1 className="mt-4 font-display text-4xl text-paper">Esta tarjeta todavía no apunta a ningún link</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          El código existe. Cargá el destino desde el panel y el próximo escaneo redirige.
        </p>
      </div>
    </main>
  );
}
