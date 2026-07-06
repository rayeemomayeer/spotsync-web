/** Illustrated top-down lot — matches reference mockup (desktop map dashboard). */
export function LotScene() {
  return (
    <g className="lot-scene" aria-hidden>
      {/* Base ground */}
      <rect x={0} y={0} width={1100} height={640} fill="#D4C4A8" />

      {/* Grass patches */}
      {[
        [70, 90, 56, 36],
        [980, 70, 48, 32],
        [40, 520, 52, 34],
        [1020, 500, 44, 30],
        [620, 520, 40, 28],
      ].map(([x, y, w, h], i) => (
        <ellipse key={`grass-${i}`} cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill="#8FB08F" opacity={0.55} />
      ))}

      {/* Upper / lower paved pads */}
      <path
        d="M 60 60 L 1040 60 L 1040 250 L 60 250 Z"
        fill="#C9BFA8"
        opacity={0.45}
      />
      <path
        d="M 60 390 L 1040 390 L 1040 580 L 60 580 Z"
        fill="#C9BFA8"
        opacity={0.45}
      />

      {/* Buildings */}
      <Building x={720} y={48} w={140} h={88} />
      <Building x={860} y={48} w={120} h={88} />
      <Building x={780} y={470} w={150} h={90} />
      <Building x={60} y={470} w={110} h={85} />

      {/* Trees */}
      {[
        [95, 55, 22],
        [200, 42, 18],
        [650, 38, 20],
        [950, 120, 24],
        [88, 430, 20],
        [250, 545, 22],
        [900, 430, 26],
        [1000, 540, 20],
      ].map(([cx, cy, r], i) => (
        <g key={`tree-${i}`}>
          <ellipse cx={cx} cy={cy + r * 0.35} rx={r * 0.9} ry={r * 0.35} fill="#000" opacity={0.08} />
          <circle cx={cx} cy={cy} r={r} fill="#6B9E6B" />
          <circle cx={cx - r * 0.2} cy={cy - r * 0.15} r={r * 0.55} fill="#7CB87C" opacity={0.85} />
        </g>
      ))}

      {/* Main horizontal road */}
      <rect x={0} y={268} width={1100} height={88} fill="#5E5E5C" />
      <rect x={0} y={302} width={1100} height={4} fill="#F5C842" />
      <rect x={0} y={310} width={1100} height={4} fill="#F5C842" />
      <rect x={0} y={318} width={1100} height={2} fill="#E8E8E8" opacity={0.25} />

      {/* Lane markings & arrows */}
      {[180, 420, 660, 900].map((x) => (
        <g key={`arrow-${x}`} fill="#FFFFFF" opacity={0.85}>
          <path d={`M ${x} 292 L ${x + 14} 308 L ${x + 6} 308 L ${x + 6} 324 L ${x - 6} 324 L ${x - 6} 308 L ${x - 14} 308 Z`} />
        </g>
      ))}
      <path d="M 120 308 L 980 308" stroke="#FFFFFF" strokeWidth={2} strokeDasharray="18 14" opacity={0.35} />

      {/* Connector roads */}
      <rect x={108} y={248} width={28} height={130} fill="#6A6A68" rx={2} />
      <rect x={964} y={248} width={28} height={130} fill="#6A6A68" rx={2} />
    </g>
  );
}

function Building({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y + 8} width={w} height={h} fill="#B8A898" rx={3} />
      <rect x={x} y={y} width={w} height={h * 0.55} fill="#C45C4A" rx={3} />
      {[
        [0.2, 0.35],
        [0.45, 0.3],
        [0.7, 0.38],
      ].map(([fx, fy], i) => (
        <rect
          key={i}
          x={x + w * fx}
          y={y + h * fy}
          width={14}
          height={10}
          fill="#888"
          rx={1}
        />
      ))}
    </g>
  );
}
