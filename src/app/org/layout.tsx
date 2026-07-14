"use client";

import { RequireRole } from "@/components/auth/RequireRole";

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole roles={["org_admin", "saas_admin"]}>{children}</RequireRole>;
}
