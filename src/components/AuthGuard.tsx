"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("inventario_auth");
    if (auth === "true") {
      setAutorizado(true);
    } else if (pathname !== "/login") {
      router.push("/login");
    }
  }, [pathname, router]);

  if (pathname === "/login") return <>{children}</>;
  if (!autorizado) return null;
  return <>{children}</>;
}
