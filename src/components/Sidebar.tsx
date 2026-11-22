"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Inicio", icon: "📊" },
  { href: "/productos", label: "Productos", icon: "📦" },
  { href: "/productos/nuevo", label: "Agregar", icon: "➕" },
  { href: "/chat", label: "Chat IA", icon: "🤖" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <h1 className="text-base font-bold text-[var(--primary)] flex items-center gap-2">
          🐾 Inventario Veterinaria
        </h1>
        <span className="text-[10px] text-[var(--muted)] text-right leading-tight">
          Cristi Tovar<br />Anyi Rojas
        </span>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[var(--border)] flex justify-around items-center px-1 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[11px] font-medium transition-colors min-w-[60px]
                ${isActive
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted)]"
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
