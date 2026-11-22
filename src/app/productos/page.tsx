"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, type Producto, type Categoria } from "@/lib/supabase";

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroUbicacion, setFiltroUbicacion] = useState<string>("todas");
  const [editandoStock, setEditandoStock] = useState<number | null>(null);
  const [nuevoStock, setNuevoStock] = useState<number>(0);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from("productos").select("*, categorias(nombre, icono)").order("nombre"),
      supabase.from("categorias").select("*").order("nombre"),
    ]);
    if (prods) setProductos(prods as any);
    if (cats) setCategorias(cats);
    setLoading(false);
  }

  async function actualizarStock(id: number, cantidad: number) {
    await supabase.from("productos").update({ stock: cantidad, updated_at: new Date().toISOString() }).eq("id", id);
    setEditandoStock(null);
    fetchData();
  }

  const productosFiltrados = productos.filter((p) => {
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.sku?.toLowerCase().includes(busqueda.toLowerCase()) || p.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = filtroCategoria === "todas" || p.categoria_id === Number(filtroCategoria);
    const matchUbicacion = filtroUbicacion === "todas" || p.ubicacion === filtroUbicacion;
    return matchBusqueda && matchCategoria && matchUbicacion;
  });

  if (loading) {
    return (<div className="flex items-center justify-center h-64"><div className="text-[var(--muted)]">Cargando...</div></div>);
  }

  return (
    <div className="space-y-3">
      <input type="text" placeholder="🔍 Buscar producto..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-white text-sm focus:outline-none focus:border-[var(--primary)]" />
      <div className="flex gap-2">
        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] bg-white text-xs focus:outline-none focus:border-[var(--primary)]">
          <option value="todas">Todas las categorías</option>
          {categorias.map((c) => (<option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>))}
        </select>
        <select value={filtroUbicacion} onChange={(e) => setFiltroUbicacion(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] bg-white text-xs focus:outline-none focus:border-[var(--primary)]">
          <option value="todas">Ubicación</option>
          <option value="bodega">🏭 Bodega</option>
          <option value="mostrador">🏪 Mostrador</option>
        </select>
      </div>
      <p className="text-xs text-[var(--muted)]">{productosFiltrados.length} de {productos.length} productos</p>
      <div className="space-y-3">
        {productosFiltrados.map((producto) => (
          <div key={producto.id} className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
            <div className="flex">
              <div className="w-24 h-24 flex-shrink-0 bg-gray-100 flex items-center justify-center overflow-hidden">
                {producto.imagen_url ? (<img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover" />) : (<span className="text-2xl opacity-30">📷</span>)}
              </div>
              <div className="flex-1 p-3 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <h3 className="font-semibold text-sm leading-tight truncate flex-1">{producto.nombre}</h3>
                  <Link href={`/productos/editar?id=${producto.id}`} className="text-[var(--primary)] text-xs px-2 py-0.5 rounded-lg bg-[var(--primary-light)] flex-shrink-0">
                    Editar
                  </Link>
                </div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary)]">{(producto as any).categorias?.icono} {(producto as any).categorias?.nombre}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${producto.ubicacion === "mostrador" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{producto.ubicacion === "mostrador" ? "🏪" : "🏭"} {producto.ubicacion}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-sm text-[var(--primary)]">${producto.precio?.toLocaleString("es-CO")}</span>
                  {editandoStock === producto.id ? (
                    <div className="flex items-center gap-1">
                      <input type="number" value={nuevoStock} onChange={(e) => setNuevoStock(Number(e.target.value))} className="w-14 px-1.5 py-1 border border-[var(--border)] rounded text-xs text-center" min={0} />
                      <button onClick={() => actualizarStock(producto.id, nuevoStock)} className="text-xs bg-[var(--primary)] text-white px-2 py-1 rounded">✓</button>
                      <button onClick={() => setEditandoStock(null)} className="text-xs bg-gray-200 px-2 py-1 rounded">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditandoStock(producto.id); setNuevoStock(producto.stock); }} className="flex items-center gap-1 text-xs">
                      <span className="font-semibold text-sm">{producto.stock} uds</span>
                      <span className="text-[var(--muted)]">✏️</span>
                    </button>
                  )}
                </div>
                {producto.fecha_vencimiento && (<div className="text-[10px] text-[var(--muted)] mt-1">📅 Vence: {new Date(producto.fecha_vencimiento).toLocaleDateString("es-CO")}</div>)}
              </div>
            </div>
          </div>
        ))}
      </div>
      {productosFiltrados.length === 0 && (<div className="text-center py-12 text-[var(--muted)]"><span className="text-3xl block mb-2">🔍</span><p className="text-sm">No se encontraron productos</p></div>)}
    </div>
  );
}
