"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { setSession } from "@/lib/session-store";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession();

  useEffect(() => {
    setSession(session || null);
  }, [session]);

  return <>{children}</>;
}
