import { ConsoleErrorBoundary } from "@/components/console/ConsoleErrorBoundary";
import { DemoModeBanner } from "@/components/demo/DemoModeBanner";
import { DriverMapExperience } from "@/components/driver/DriverMapExperience";

/** Map-first driver booking — Uber/Pathao style. Ops grid lives at /console. */
export default function DriverPage() {
  return (
    <ConsoleErrorBoundary>
      <DemoModeBanner />
      <DriverMapExperience />
    </ConsoleErrorBoundary>
  );
}
