"use client";

import { RequireRole } from "@/components/auth/RequireRole";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["driver", "org_admin", "saas_admin"]}>{children}</RequireRole>
  );
}
