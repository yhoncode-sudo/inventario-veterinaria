"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase, type Categoria } from "@/lib/supabase";

export default function EditarProductoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [form, setForm] = useState({
    nombre: "", descripcion: "", categoria_id: "", imagen_url: "",
    precio: "", stock: "", stock_minimo: "5", ubicacion: "bodega",
    fecha_vencimiento: "", proveedor: "", sku: "",
  });

  useEffect(() => {
    async function cargar() {
      const [{ data: cats }, { data: prod }] = await Promise.all([
        supabase.from("categorias").select("*").order("nombre"),
        supabase.from("productos").select("*").eq("id", Number(id)).single(),
      ]);
      if (cats) setCategorias(cats);
      if (prod) {
        setForm({
          nombre: prod.nombre || "",
          descripcion: prod.descripcion || "",
          categoria_id: String(prod.categoria_id || ""),
          imagen_url: prod.imagen_url || "",
          precio: String(prod.precio || ""),
          stock: String(prod.stock || ""),
          stock_minimo: String(prod.stock_minimo || "5"),
          ubicacion: prod.ubicacion || "bodega",
          fecha_vencimiento: prod.fecha_vencimiento ? prod.fecha_vencimiento.split("T")[0] : "",
          proveedor: prod.proveedor || "",
          sku: prod.sku || "",
        });
      }
      setCargando(false);
    }
    if (id) cargar();
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);
    const { error } = await supabase.from("productos").update({
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      categoria_id: Number(form.categoria_id),
      imagen_url: form.imagen_url || null,
      precio: Number(form.precio) || 0,
      stock: Number(form.stock) || 0,
      stock_minimo: Number(form.stock_minimo) || 5,
      ubicacion: form.ubicacion,
      fecha_vencimiento: form.fecha_vencimiento || null,
      proveedor: form.proveedor || null,
      sku: form.sku || null,
      updated_at: new Date().toISOString(),
    }).eq("id", Number(id));
    setGuardando(false);
    if (error) {
      setMensaje({ tipo: "error", texto: "Error: " + error.message });
    } else {
      setMensaje({ tipo: "ok", texto: "¡Producto actualizado!" });
      setTimeout(() => router.push("/productos"), 1200);
    }
  }

  if (cargando) {
    return <div className="flex items-center justify-center h-64"><div className="text-[var(--muted)]">Cargando...</div></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => router.push("/productos")} className="text-sm text-[var(--primary)]">← Volver</button>
        <h1 className="text-lg font-bold">Editar Producto</h1>
      </div>
      {mensaje && (
        <div className={`p-3 rounded-xl text-sm ${mensaje.tipo === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {mensaje.tipo === "ok" ? "✅" : "❌"} {mensaje.texto}
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[var(--border)] p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1">Nombre <span className="text-red-500">*</span></label>
          <input type="text" name="nombre" required value={form.nombre} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)]" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)] resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Categoría <span className="text-red-500">*</span></label>
            <select name="categoria_id" required value={form.categoria_id} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)]">
              <option value="">Seleccionar</option>
              {categorias.map((c) => (<option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Ubicación</label>
            <select name="ubicacion" value={form.ubicacion} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)]">
              <option value="bodega">🏭 Bodega</option>
              <option value="mostrador">🏪 Mostrador</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Precio $</label>
            <input type="number" name="precio" value={form.precio} onChange={handleChange} min="0" className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)]" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Stock</label>
            <input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)]" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Mínimo</label>
            <input type="number" name="stock_minimo" value={form.stock_minimo} onChange={handleChange} min="0" className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)]" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">URL de imagen</label>
          <input type="url" name="imagen_url" value={form.imagen_url} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)]" />
          {form.imagen_url && (
            <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-[var(--border)]">
              <img src={form.imagen_url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Vencimiento</label>
            <input type="date" name="fecha_vencimiento" value={form.fecha_vencimiento} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)]" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Proveedor</label>
            <input type="text" name="proveedor" value={form.proveedor} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)]" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">SKU / Código</label>
          <input type="text" name="sku" value={form.sku} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)]" />
        </div>
        <button type="submit" disabled={guardando} className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-medium active:opacity-90 disabled:opacity-50">
          {guardando ? "Guardando..." : "💾 Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}
