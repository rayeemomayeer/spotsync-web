import { redirect } from "next/navigation";

/** Health probes live under Observe. */
export default function PlatformHealthRedirect() {
  redirect("/platform/observe");
}
