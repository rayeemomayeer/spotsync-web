/** Portfolio demo UI (ghost grid, Demo Driver/Admin buttons, auto demo login). */
export function isDemoModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}
