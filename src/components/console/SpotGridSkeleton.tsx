"use client";

export function SpotGridSkeleton() {
  return (
    <div className="console-spot-grid console-spot-grid--loading" aria-busy="true" aria-label="Loading spots">
      {Array.from({ length: 2 }).map((_, block) => (
        <section key={block} className="console-spot-block">
          <div className="console-skeleton console-skeleton--title" />
          <div className="console-spot-block__cells">
            {Array.from({ length: 12 }).map((__, cell) => (
              <div key={cell} className="console-skeleton console-skeleton--cell" />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
