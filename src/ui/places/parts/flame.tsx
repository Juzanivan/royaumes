/** Flamme vivante, posée à (x, y) par sa base, de taille s : trois langues qui vacillent. */
export function Flame({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g className="place-flame" transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0,0 C-14,-10 -10,-30 0,-48 C10,-30 14,-10 0,0 Z" fill="#ff8a2a" />
      <path
        d="M0,0 C-9,-8 -6,-22 0,-34 C6,-22 9,-8 0,0 Z"
        fill="#ffc247"
        style={{ animationDelay: '0.2s' }}
      />
      <path
        d="M0,0 C-4,-5 -3,-12 0,-18 C3,-12 4,-5 0,0 Z"
        fill="#fff1b8"
        style={{ animationDelay: '0.4s' }}
      />
    </g>
  )
}
