import { redirect } from "next/navigation";

/** Grafana lives inside Observe — keep one metrics surface. */
export default function PlatformGrafanaRedirect() {
  redirect("/platform/observe#grafana");
}
