/** Tapis rouge en perspective, qui part du bas de la scène jusqu'au podium, sur la ligne y. */
export function Carpet({ y }: { y: number }) {
  return (
    <g>
      <path d={`M700,${y} H900 L1120,900 H480 Z`} fill="#9b2335" />
      <path d={`M712,${y} L506,900 M888,${y} L1094,900`} stroke="#d4a017" strokeWidth={6} />
    </g>
  )
}
