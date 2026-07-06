"use client";

export type MobileTab = "zones" | "grid" | "sidebar";

export function MobileTabBar({
  active,
  onChange,
}: {
  active: MobileTab;
  onChange: (tab: MobileTab) => void;
}) {
  const tabs: { id: MobileTab; label: string }[] = [
    { id: "zones", label: "Zones" },
    { id: "grid", label: "Grid" },
    { id: "sidebar", label: "Activity" },
  ];

  return (
    <nav className="console-mobile-tabs" aria-label="Console sections">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`console-mobile-tabs__btn ${active === tab.id ? "console-mobile-tabs__btn--active" : ""}`}
          onClick={() => onChange(tab.id)}
          aria-current={active === tab.id ? "page" : undefined}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
