import { ConsoleErrorBoundary } from "@/components/console/ConsoleErrorBoundary";
import { LiveConsole } from "@/components/LiveConsole";

/** Driver shell — map/book via LiveConsole until slim map UI ships. */
export default function DriverPage() {
  return (
    <ConsoleErrorBoundary>
      <LiveConsole />
    </ConsoleErrorBoundary>
  );
}
