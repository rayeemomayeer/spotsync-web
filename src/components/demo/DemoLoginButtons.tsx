"use client";

export function DemoLoginButtons({
  onDriver,
  onDemoAdmin,
  onAdmin,
  loading,
}: {
  onDriver: () => void;
  onDemoAdmin: () => void;
  onAdmin?: () => void;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={onDriver}
        className="rounded-full bg-[#7EC8E3] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#6ab8d4] disabled:opacity-50"
      >
        Demo Driver
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={onDemoAdmin}
        className="rounded-full bg-[#6B9E6B] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5a8d5a] disabled:opacity-50"
      >
        Demo Org admin
      </button>
      {onAdmin ? (
        <button
          type="button"
          disabled={loading}
          onClick={onAdmin}
          className="rounded-full border border-[#E0565B] px-4 py-2 text-sm font-medium text-[#E0565B] transition hover:bg-[rgba(224,86,91,0.08)] disabled:opacity-50"
        >
          Demo Platform admin
        </button>
      ) : null}
    </div>
  );
}
