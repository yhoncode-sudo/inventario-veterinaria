import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY || "" });
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
}

export async function POST(req: NextRequest) {
  try {
    const { mensaje } = await req.json();
    const groq = getGroq();
    const supabase = getSupabase();

    const { data: productos } = await supabase
      .from("productos")
      .select("*, categorias(nombre, icono)")
      .order("nombre");

    const inventarioTexto = productos
      ?.map((p: any) => {
        const vencimiento = p.fecha_vencimiento
          ? `Vence: ${new Date(p.fecha_vencimiento).toLocaleDateString("es-CO")}`
          : "Sin fecha de vencimiento";
        return `- ${p.nombre} | Categoría: ${p.categorias?.nombre} | Stock: ${p.stock} unidades | Ubicación: ${p.ubicacion} | Precio: $${p.precio?.toLocaleString("es-CO")} COP | ${vencimiento} | SKU: ${p.sku} | Proveedor: ${p.proveedor || "N/A"}`;
      })
      .join("\n");

    const systemPrompt = `Eres un asistente de inventario para una clínica veterinaria llamada "Inventario Veterinaria".
Tu trabajo es responder preguntas sobre el inventario de productos de la clínica.

Responde siempre en español, de forma amigable y concisa.
Si te preguntan por un producto, da toda la información disponible: nombre, categoría, stock, ubicación, precio, fecha de vencimiento y proveedor.
Si te preguntan por cantidades, sé preciso con los números.
Si te preguntan por productos que no existen en el inventario, dilo claramente.
Puedes hacer resúmenes, comparaciones y recomendaciones basadas en los datos.

Este es el inventario actual:
${inventarioTexto}

Total de productos: ${productos?.length || 0}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: mensaje },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 1024,
    });

    const respuesta = chatCompletion.choices[0]?.message?.content || "No pude procesar tu consulta.";
    return NextResponse.json({ respuesta });
  } catch (error: any) {
    console.error("Error en chat:", error);
    return NextResponse.json(
      { respuesta: "Hubo un error al procesar tu consulta. Verifica que la API key de Groq esté configurada." },
      { status: 500 }
    );
  }
}
