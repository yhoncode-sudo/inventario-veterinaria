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

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
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

      productos.forEach((p: any) => {
        if (p.ubicacion === "bodega") enBodega++;
        else enMostrador++;

        const catNombre = p.categorias?.nombre || "Sin categoría";
        const catIcono = p.categorias?.icono || "📦";
        const existing = categoriaMap.get(catNombre);
        if (existing) existing.count++;
        else categoriaMap.set(catNombre, { nombre: catNombre, icono: catIcono, count: 1 });
      });

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
