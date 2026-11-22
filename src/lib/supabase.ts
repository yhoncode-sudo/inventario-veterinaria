import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

export type Categoria = {
  id: number;
  nombre: string;
  icono: string;
};

export type Producto = {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria_id: number;
  imagen_url: string | null;
  precio: number;
  stock: number;
  stock_minimo: number;
  ubicacion: string;
  fecha_vencimiento: string | null;
  proveedor: string | null;
  sku: string | null;
  created_at: string;
  updated_at: string;
  categorias?: Categoria;
};
