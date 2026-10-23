/** Toile d'araignée tendue dans un coin, dont l'angle est au point (x, y) ; flip la retourne. */
export function Cobweb({
  x,
  y,
  r = 150,
  flip = false,
}: {
  x: number
  y: number
  r?: number
  flip?: boolean
}) {
  const angles = [0, 0.25, 0.5, 0.75, 1].map((t) => (t * Math.PI) / 2)
  const point = (a: number, d: number) => `${Math.cos(a) * d},${Math.sin(a) * d}`
  return (
    <g
      transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}
      stroke="rgb(220 220 230 / 0.35)"
      strokeWidth={1.5}
      fill="none"
    >
      {angles.map((a) => (
        <line key={a} x1={0} y1={0} x2={Math.cos(a) * r} y2={Math.sin(a) * r} />
      ))}
      {[0.3, 0.55, 0.8].map((t) => (
        <path
          key={t}
          d={`M${point(angles[0], r * t)}${angles
            .slice(1)
            .map((a, i) => ` Q${point((a + angles[i]) / 2, r * t * 0.8)} ${point(a, r * t)}`)
            .join('')}`}
        />
      ))}
    </g>
  )
}
