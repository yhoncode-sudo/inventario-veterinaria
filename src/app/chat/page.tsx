"use client";

import { useState, useRef, useEffect } from "react";

interface Mensaje { rol: "user" | "assistant"; contenido: string; }

export default function ChatPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [mensajes, cargando]);

  async function enviar() {
    const texto = input.trim();
    if (!texto || cargando) return;
    setInput("");
    setMensajes((prev) => [...prev, { rol: "user", contenido: texto }]);
    setCargando(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mensaje: texto }) });
      const data = await res.json();
      setMensajes((prev) => [...prev, { rol: "assistant", contenido: data.respuesta || "Error al obtener respuesta" }]);
    } catch { setMensajes((prev) => [...prev, { rol: "assistant", contenido: "Error de conexión" }]); }
    finally { setCargando(false); }
  }

  const sugerencias = ["¿Cuántos medicamentos hay?", "¿Qué hay en bodega?", "¿Productos próximos a vencer?", "¿Cuál es el producto más caro?", "Resumen del inventario"];

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-3">
        {mensajes.length === 0 && (
          <div className="text-center pt-8 space-y-4">
            <div className="text-4xl">🤖</div>
            <p className="text-sm text-[var(--text-secondary)]">Pregúntame sobre el inventario</p>
            <div className="flex flex-wrap justify-center gap-2 px-2">
              {sugerencias.map((s) => (<button key={s} onClick={() => { setInput(s); }} className="px-3 py-1.5 text-xs bg-white border border-[var(--border)] rounded-full active:bg-gray-50">{s}</button>))}
            </div>
          </div>
        )}
        {mensajes.map((m, i) => (
          <div key={i} className={`flex ${m.rol === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${m.rol === "user" ? "bg-[var(--primary)] text-white rounded-br-md" : "bg-white border border-[var(--border)] rounded-bl-md"}`} style={{ whiteSpace: "pre-wrap" }}>{m.contenido}</div>
          </div>
        ))}
        {cargando && (<div className="flex justify-start"><div className="bg-white border border-[var(--border)] px-4 py-3 rounded-2xl rounded-bl-md"><div className="flex gap-1.5"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} /><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} /><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} /></div></div></div>)}
      </div>
      <div className="border-t border-[var(--border)] bg-white -mx-4 px-4 py-2.5">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && enviar()} placeholder="Escribe tu pregunta..." disabled={cargando} className="flex-1 px-4 py-2.5 rounded-full border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)] disabled:opacity-50" />
          <button onClick={enviar} disabled={cargando || !input.trim()} className="w-10 h-10 flex items-center justify-center bg-[var(--primary)] text-white rounded-full active:opacity-90 disabled:opacity-50 shrink-0">➤</button>
        </div>
      </div>
    </div>
  );
}
