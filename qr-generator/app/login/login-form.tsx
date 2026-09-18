import { login } from "@/app/actions/auth";

export function LoginForm() {
  return (
    <form action={login} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm">
        Clave
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="border border-rule bg-floor px-3 py-2 text-paper"
        />
      </label>
      <button
        type="submit"
        className="bg-cyan px-4 py-2.5 font-medium text-ink transition-transform duration-150 hover:-translate-y-px active:translate-y-px"
      >
        Entrar
      </button>
    </form>
  );
}
