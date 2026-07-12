import { ConsoleErrorBoundary } from "@/components/console/ConsoleErrorBoundary";
import { LiveConsole } from "@/components/LiveConsole";

export default function ConsolePage() {
  return (
    <ConsoleErrorBoundary>
      <LiveConsole />
    </ConsoleErrorBoundary>
  );
}
