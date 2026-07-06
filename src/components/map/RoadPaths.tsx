export function RoadPaths() {
  return (
    <g className="roads">
      <rect x="0" y="0" width="900" height="560" fill="#D4C4A8" />
      <rect x="520" y="40" width="120" height="80" fill="#C45C4A" rx="4" />
      <rect x="520" y="420" width="120" height="80" fill="#C45C4A" rx="4" />
      <rect x="680" y="200" width="100" height="160" fill="#C45C4A" rx="4" />
      {[
        [560, 30, 12, 12],
        [580, 30, 8, 8],
        [700, 190, 10, 10],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill="#888" rx="1" />
      ))}
      {[
        [80, 80, 28],
        [820, 100, 22],
        [820, 400, 26],
        [100, 480, 24],
        [650, 380, 20],
      ].map(([cx, cy, r], i) => (
        <g key={`tree-${i}`}>
          <circle cx={cx} cy={cy} r={r} fill="#6B9E6B" opacity={0.9} />
          <circle cx={cx} cy={cy} r={r * 0.55} fill="#7CB87C" />
        </g>
      ))}
      <path
        d="M 20 280 L 880 280"
        stroke="#E8DCC8"
        strokeWidth="36"
        fill="none"
        strokeDasharray="12 8"
      />
      <path d="M 20 280 L 880 280" stroke="#F5C842" strokeWidth="2" fill="none" opacity={0.6} />
      <path d="M 120 60 L 120 500" stroke="#E8DCC8" strokeWidth="24" fill="none" opacity={0.5} />
    </g>
  );
}
