import type { Metadata, Viewport } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Inventario Veterinaria",
  description: "Sistema de gestión de inventario para clínica veterinaria",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Inventario Vet",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body
        className="min-h-full flex flex-col bg-[var(--background)]"
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      >
        <Sidebar />
        <main className="flex-1 overflow-auto pt-[52px] pb-[68px] px-4 py-4">
          {children}
        </main>
      </body>
    </html>
  );
}
