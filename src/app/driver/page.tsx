import { ConsoleErrorBoundary } from "@/components/console/ConsoleErrorBoundary";
import { DriverMapExperience } from "@/components/driver/DriverMapExperience";

/** Map-first driver booking — Uber/Pathao style. Ops grid lives at /console. */
export default function DriverPage() {
  return (
    <ConsoleErrorBoundary>
      <DriverMapExperience />
    </ConsoleErrorBoundary>
  );
}
