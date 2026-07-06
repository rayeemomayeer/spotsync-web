import { ConsoleErrorBoundary } from "@/components/console/ConsoleErrorBoundary";
import { LiveConsole } from "@/components/LiveConsole";

export default function Home() {
  return (
    <ConsoleErrorBoundary>
      <LiveConsole />
    </ConsoleErrorBoundary>
  );
}
