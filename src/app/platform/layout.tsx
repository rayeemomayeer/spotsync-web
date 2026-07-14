"use client";

import { RequireRole } from "@/components/auth/RequireRole";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole roles={["saas_admin"]}>{children}</RequireRole>;
}
