/** Registration-mark corner ticks — the drafting-set signature. */
const TICK = 7;

export default function Ticks({
  color = 'var(--line-strong)',
  size = TICK,
  inset = -1,
}: {
  color?: string;
  size?: number;
  inset?: number;
}) {
  const corners: React.CSSProperties[] = [
    { top: inset, left: inset, borderWidth: '1px 0 0 1px' },
    { top: inset, right: inset, borderWidth: '1px 1px 0 0' },
    { bottom: inset, left: inset, borderWidth: '0 0 1px 1px' },
    { bottom: inset, right: inset, borderWidth: '0 1px 1px 0' },
  ];
  return (
    <>
      {corners.map((pos, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderStyle: 'solid',
            borderColor: color,
            pointerEvents: 'none',
            ...pos,
          }}
        />
      ))}
    </>
  );
}
