import { jitter, Parallax, range, TILE } from './parallax'
import { Bush, Oak, Pine } from './trees'

/** Ligne de la route : les roues du chariot et les pieds des personnages y sont posés. */
export const ROAD = 700

/** Collines lointaines, qui défilent très lentement. */
function Hills() {
  return (
    <Parallax seconds={140}>
      <path
        className="journey-hills-far"
        d={`M0,520 C200,380 400,430 600,470 C800,510 1000,360 1250,420 C1400,455 1500,470 ${TILE},520 V${ROAD} H0 Z`}
      />
      <path
        className="journey-hills-near"
        d={`M0,580 C250,500 450,540 700,560 C950,580 1150,480 1400,530 C1500,550 1560,560 ${TILE},580 V${ROAD} H0 Z`}
      />
    </Parallax>
  )
}

/** Forêt du fond : une rangée serrée de sapins sombres. */
function FarForest() {
  return (
    <Parallax seconds={60}>
      {range(34).map((i) => (
        <Pine
          key={i}
          x={i * (TILE / 34) + jitter(i) * 30}
          y={612}
          h={110 + jitter(i, 2) * 70}
          color={i % 3 === 0 ? '#2f5a3a' : '#29503a'}
        />
      ))}
    </Parallax>
  )
}

/** Forêt proche : sapins et feuillus plus grands, plus espacés. */
function NearForest() {
  return (
    <Parallax seconds={26}>
      {range(12).map((i) => {
        const x = i * (TILE / 12) + jitter(i, 3) * 60
        const h = 190 + jitter(i, 4) * 90
        return i % 3 === 1 ? (
          <Oak key={i} x={x} y={646} h={h} color="#3f7a3c" />
        ) : (
          <Pine key={i} x={x} y={646} h={h} color="#356b3f" />
        )
      })}
      {range(10).map((i) => (
        <Bush key={`b${i}`} x={i * 160 + 70} y={650} w={70 + jitter(i, 5) * 40} color="#4b8a44" />
      ))}
    </Parallax>
  )
}

/** Route de terre, ses cailloux et ses ornières, qui défilent à la vitesse du chariot. */
function Road() {
  return (
    <g>
      <rect y={640} width={TILE} height={900 - 640} className="journey-grass" />
      <rect y={ROAD - 50} width={TILE} height={110} className="journey-road" />
      <Parallax seconds={7}>
        {range(26).map((i) => (
          <ellipse
            key={i}
            cx={i * (TILE / 26) + jitter(i, 6) * 40}
            cy={ROAD - 30 + jitter(i, 7) * 80}
            rx={4 + jitter(i, 8) * 6}
            ry={2 + jitter(i, 9) * 3}
            className="journey-pebble"
          />
        ))}
        <path d={`M0,${ROAD - 8} H${TILE}`} className="journey-rut" />
        <path d={`M0,${ROAD + 30} H${TILE}`} className="journey-rut" />
      </Parallax>
    </g>
  )
}

/** Herbes hautes et buissons du premier plan, qui passent très vite. */
function Foreground() {
  return (
    <Parallax seconds={4}>
      {range(6).map((i) => (
        <Bush key={i} x={i * 280 + 120 + jitter(i, 10) * 80} y={905} w={150} color="#3d7a37" />
      ))}
      {range(40).map((i) => {
        const x = i * 40 + jitter(i, 11) * 20
        return (
          <path
            key={`g${i}`}
            d={`M${x},900 q4,-30 10,-${36 + jitter(i, 12) * 24} M${x + 6},900 q-2,-24 -8,-30`}
            className="journey-blade"
          />
        )
      })}
    </Parallax>
  )
}

/** Paysage complet, du ciel au premier plan, à l'exception du premier plan (dessiné à part). */
export function Landscape() {
  return (
    <>
      <Hills />
      <FarForest />
      <NearForest />
      <Road />
    </>
  )
}

export { Foreground }
