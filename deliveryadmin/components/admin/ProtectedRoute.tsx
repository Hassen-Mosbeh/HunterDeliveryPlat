"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    if (!token) {
      router.replace("/");
    }
  }, [token, router]);

  if (!token) return null;

  return <>{children}</>;
}
