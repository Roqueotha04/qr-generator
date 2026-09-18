import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-6">
      <div className="w-full max-w-md border border-rule bg-panel p-8">
        <p className="font-mono text-xs text-cyan">Taller QR</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Entrar al panel</h1>
        <p className="mt-3 text-sm text-muted">
          Un solo acceso de administrador. Las tarjetas escaneadas no pasan por acá.
        </p>
        {error ? (
          <p className="mt-4 border border-press/40 bg-press/10 px-3 py-2 text-sm text-paper">
            La clave no coincide.
          </p>
        ) : null}
        <LoginForm />
      </div>
    </main>
  );
}
