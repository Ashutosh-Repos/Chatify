"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import PageLoader from "@/components/ui/PageLoader";

export default function ChatLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isCheckingAuth && !authUser) {
      router.push("/login");
    }
  }, [isCheckingAuth, authUser, router]);

  if (isCheckingAuth) {
    return <PageLoader />;
  }

  if (!authUser) {
    return null;
  }

  return <>{children}</>;
}
