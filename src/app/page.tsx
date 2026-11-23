"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Stats = {
  total: number;
  enBodega: number;
  enMostrador: number;
  categorias: { nombre: string; icono: string; count: number }[];
};

type ProductoVencimiento = {
  id: number;
  nombre: string;
  fecha_vencimiento: string;
  stock: number;
  ubicacion: string;
  diasRestantes: number;
};

function getSemaforoColor(dias: number): { bg: string; text: string; label: string; emoji: string } {
  if (dias <= 0) return { bg: "bg-red-100 border-red-300", text: "text-red-700", label: "Vencido", emoji: "🔴" };
  if (dias <= 15) return { bg: "bg-red-50 border-red-200", text: "text-red-600", label: `${dias}d`, emoji: "🔴" };
  if (dias <= 30) return { bg: "bg-amber-50 border-amber-200", text: "text-amber-600", label: `${dias}d`, emoji: "🟡" };
  return { bg: "bg-green-50 border-green-200", text: "text-green-600", label: `${dias}d`, emoji: "🟢" };
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [proximosVencer, setProximosVencer] = useState<ProductoVencimiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const { data: productos } = await supabase
        .from("productos")
        .select("*, categorias(nombre, icono)");

      if (!productos) return;

      const categoriaMap = new Map<string, { nombre: string; icono: string; count: number }>();
      let enBodega = 0;
      let enMostrador = 0;

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const proximos: ProductoVencimiento[] = [];

      productos.forEach((p: any) => {
        if (p.ubicacion === "bodega") enBodega++;
        else enMostrador++;

        const catNombre = p.categorias?.nombre || "Sin categoría";
        const catIcono = p.categorias?.icono || "📦";
        const existing = categoriaMap.get(catNombre);
        if (existing) existing.count++;
        else categoriaMap.set(catNombre, { nombre: catNombre, icono: catIcono, count: 1 });

        // Semáforo: productos con fecha de vencimiento dentro de 40 días
        if (p.fecha_vencimiento) {
          const fechaVenc = new Date(p.fecha_vencimiento);
          fechaVenc.setHours(0, 0, 0, 0);
          const diffMs = fechaVenc.getTime() - hoy.getTime();
          const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          if (diffDias <= 40) {
            proximos.push({
              id: p.id,
              nombre: p.nombre,
              fecha_vencimiento: p.fecha_vencimiento,
              stock: p.stock,
              ubicacion: p.ubicacion,
              diasRestantes: diffDias,
            });
          }
        }
      });

      // Ordenar por días restantes (más urgente primero)
      proximos.sort((a, b) => a.diasRestantes - b.diasRestantes);

      setProximosVencer(proximos);
      setStats({
        total: productos.length,
        enBodega,
        enMostrador,
        categorias: Array.from(categoriaMap.values()),
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--muted)]">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-[var(--border)] p-3 text-center">
          <div className="text-2xl mb-1">📦</div>
          <div className="text-2xl font-bold text-[var(--primary)]">{stats?.total}</div>
          <div className="text-[10px] text-[var(--muted)]">Total</div>
        </div>
        <div className="bg-white rounded-xl border border-[var(--border)] p-3 text-center">
          <div className="text-2xl mb-1">🏪</div>
          <div className="text-2xl font-bold text-[var(--accent)]">{stats?.enMostrador}</div>
          <div className="text-[10px] text-[var(--muted)]">Mostrador</div>
        </div>
        <div className="bg-white rounded-xl border border-[var(--border)] p-3 text-center">
          <div className="text-2xl mb-1">🏭</div>
          <div className="text-2xl font-bold text-[var(--warning)]">{stats?.enBodega}</div>
          <div className="text-[10px] text-[var(--muted)]">Bodega</div>
        </div>
      </div>

      {/* Semáforo de Vencimiento */}
      {proximosVencer.length > 0 && (
        <div className="bg-white rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🚦</span>
            <h2 className="text-sm font-semibold">Próximos a Vencer</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">{proximosVencer.length}</span>
          </div>
          <div className="space-y-2">
            {proximosVencer.map((p) => {
              const semaforo = getSemaforoColor(p.diasRestantes);
              return (
                <Link href={`/productos/editar?id=${p.id}`} key={p.id} className={`flex items-center justify-between p-2.5 rounded-lg border ${semaforo.bg}`}>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs truncate">{p.nombre}</div>
                    <div className="text-[10px] text-[var(--muted)]">
                      {p.stock} uds &middot; {p.ubicacion} &middot; Vence: {new Date(p.fecha_vencimiento).toLocaleDateString("es-CO")}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 flex-shrink-0 ml-2 ${semaforo.text}`}>
                    <span className="text-sm">{semaforo.emoji}</span>
                    <span className="text-xs font-bold">{semaforo.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[var(--border)] p-4">
        <h2 className="text-sm font-semibold mb-3">Por Categoría</h2>
        <div className="grid grid-cols-2 gap-2">
          {stats?.categorias.map((cat) => (
            <div
              key={cat.nombre}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)]"
            >
              <span className="text-lg">{cat.icono}</span>
              <div>
                <div className="font-medium text-xs">{cat.nombre}</div>
                <div className="text-[10px] text-[var(--muted)]">{cat.count} productos</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Link
          href="/productos/nuevo"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[var(--border)] active:bg-gray-50"
        >
          <span className="text-2xl">➕</span>
          <div>
            <div className="font-semibold text-sm">Agregar Producto</div>
            <div className="text-xs text-[var(--muted)]">Registrar un nuevo producto</div>
          </div>
        </Link>
        <Link
          href="/chat"
          className="flex items-center gap-3 p-4 bg-[var(--primary)] rounded-xl text-white active:opacity-90"
        >
          <span className="text-2xl">🤖</span>
          <div>
            <div className="font-semibold text-sm">Chat con IA</div>
            <div className="text-xs opacity-80">Pregunta sobre el inventario</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
