import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  const debug: Record<string, unknown> = {
    supabase_url_set: !!url,
    supabase_url_preview: url ? url.substring(0, 35) + "..." : "EMPTY",
    supabase_key_set: !!key,
    supabase_key_length: key.length,
    groq_key_set: !!process.env.GROQ_API_KEY,
  };

  if (!url || !key) {
    debug.error = "Supabase URL or Key is missing";
    return NextResponse.json(debug);
  }

  try {
    const supabase = createClient(url, key);

    const { data: cats, error: catError } = await supabase
      .from("categorias")
      .select("id, nombre");
    debug.categorias_count = cats?.length ?? 0;
    debug.categorias_error = catError ? catError.message : null;
    debug.categorias = cats?.map((c: any) => c.nombre) ?? [];

    const { data: prods, error: prodError } = await supabase
      .from("productos")
      .select("id, nombre");
    debug.productos_count = prods?.length ?? 0;
    debug.productos_error = prodError ? prodError.message : null;
    debug.productos_sample = prods?.slice(0, 3).map((p: any) => p.nombre) ?? [];

  } catch (err: any) {
    debug.connection_error = err?.message || "Unknown error";
  }

  return NextResponse.json(debug, {
    headers: { "Cache-Control": "no-store" },
  });
}
