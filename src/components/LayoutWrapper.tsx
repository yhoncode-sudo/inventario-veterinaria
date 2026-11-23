"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import AuthGuard from "./AuthGuard";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <AuthGuard>
      {!isLogin && <Sidebar />}
      <main className={isLogin ? "" : "flex-1 overflow-auto pt-[52px] pb-[68px] px-4 py-4"}>
        {children}
      </main>
    </AuthGuard>
  );
}
