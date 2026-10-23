/** Vol d'oiseaux qui traverse lentement le ciel, en V. */
export function Birds({ y }: { y: number }) {
  const birds: [number, number][] = [
    [0, 0],
    [-26, 12],
    [-50, 22],
    [-24, -12],
    [-46, -20],
  ]
  return (
    <g className="title-birds">
      {birds.map(([dx, dy]) => (
        <path
          key={`${dx},${dy}`}
          className="title-bird"
          d={`M${dx - 9},${y + dy} q5,-6 9,0 q4,-6 9,0`}
          stroke="#2b2118"
          strokeWidth={2.4}
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </g>
  )
}
