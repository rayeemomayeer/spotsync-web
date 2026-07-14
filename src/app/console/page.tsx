"use client";

import { RequireRole } from "@/components/auth/RequireRole";
import { ConsoleErrorBoundary } from "@/components/console/ConsoleErrorBoundary";
import { LiveConsole } from "@/components/LiveConsole";

/** Ops three-column console — platform + driver demo only (not org_admin). */
export default function ConsolePage() {
  return (
    <RequireRole roles={["saas_admin", "driver", "admin"]}>
      <ConsoleErrorBoundary>
        <LiveConsole />
      </ConsoleErrorBoundary>
    </RequireRole>
  );
}
