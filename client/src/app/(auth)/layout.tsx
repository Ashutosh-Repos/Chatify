import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { ReactNode } from "react";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  let session = null;
  
  try {
    session = await auth();
  } catch (error) {
    // Ignore JWT errors from stale cookies - user will just see login page
    console.error("Auth check failed:", error);
  }

  // If already logged in, redirect to chat
  if (session?.user) {
    redirect("/");
  }

  return <>{children}</>;
}
