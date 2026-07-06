const CAR_COLORS = ["#E74C3C", "#F5F5F5", "#2ECC71", "#F1C40F", "#95A5A6", "#3498DB", "#E67E22"];

export function carColorForSpot(id: number, ghost: boolean) {
  if (ghost) return "#7EC8E3";
  return CAR_COLORS[id % CAR_COLORS.length];
}

/** Top-down flat vector car aligned to angled stall */
export function ParkedCar({
  x,
  y,
  color,
  selected,
}: {
  x: number;
  y: number;
  color: string;
  selected?: boolean;
}) {
  const cx = x + 20;
  const cy = y + 30;
  return (
    <g transform={`translate(${x + 4}, ${y + 10}) rotate(-35 ${cx} ${cy})`}>
      {selected && (
        <>
          <circle cx={16} cy={14} r={22} fill="none" stroke="#7EC8E3" strokeWidth={2} opacity={0.35} />
          <circle cx={16} cy={14} r={18} fill="none" stroke="#7EC8E3" strokeWidth={2.5} opacity={0.65} />
        </>
      )}
      <rect x={2} y={10} width={28} height={14} rx={3} fill={color} stroke="#333" strokeWidth={0.5} opacity={0.95} />
      <rect x={6} y={4} width={20} height={10} rx={2} fill={color} stroke="#333" strokeWidth={0.5} opacity={0.9} />
      <rect x={8} y={5} width={7} height={6} rx={1} fill="#E8F4FC" opacity={0.85} />
      <rect x={17} y={5} width={7} height={6} rx={1} fill="#E8F4FC" opacity={0.85} />
    </g>
  );
}
