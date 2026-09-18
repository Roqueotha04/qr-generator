"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, SignOut, SquaresFour } from "@phosphor-icons/react";
import { logout } from "@/app/actions/auth";

const links = [
  { href: "/admin", label: "Inventario", icon: SquaresFour, exact: true },
  { href: "/admin/generar", label: "Generar", icon: Plus, exact: false },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-row items-center justify-between gap-4 border-b border-rule bg-panel px-4 py-3 lg:h-auto lg:w-56 lg:flex-col lg:items-stretch lg:justify-start lg:border-b-0 lg:border-r lg:px-5 lg:py-8">
      <div>
        <p className="font-mono text-[11px] text-cyan">Taller QR</p>
        <p className="mt-1 hidden text-lg font-semibold lg:block">Panel</p>
      </div>
      <nav className="flex flex-1 items-center gap-2 lg:mt-8 lg:flex-col lg:items-stretch">
        {links.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm ${
                active ? "bg-floor text-paper" : "text-muted hover:text-paper"
              }`}
            >
              <Icon size={16} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <form action={logout}>
        <button
          type="submit"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-paper"
        >
          <SignOut size={16} />
          Salir
        </button>
      </form>
    </aside>
  );
}
