"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError("");

    setTimeout(() => {
      if (usuario === "admin" && clave === "vet2024") {
        localStorage.setItem("inventario_auth", "true");
        router.push("/");
      } else {
        setError("Usuario o contraseña incorrectos");
      }
      setCargando(false);
    }, 500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-3">🐾</div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Inventario Veterinaria</h1>
          <p className="text-xs text-[var(--muted)] mt-1">Sistema de gestión de inventario</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200 text-center">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[var(--border)] p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ingresa tu usuario"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Contraseña</label>
            <input
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-medium active:opacity-90 disabled:opacity-50"
          >
            {cargando ? "Ingresando..." : "🔐 Iniciar Sesión"}
          </button>
        </form>

        <p className="text-center text-[10px] text-[var(--muted)]">
          Desarrollado por Cristi Tovar
        </p>
      </div>
    </div>
  );
}
