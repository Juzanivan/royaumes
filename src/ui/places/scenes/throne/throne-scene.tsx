import { WallTorch } from '../../parts/wall-torch'
import { CastleScene } from '../castle/castle-scene'

/**
 * Décor du profil : la grande salle du château, vue depuis l'estrade du trône. Le trône, sa
 * couronne posée sur le siège, se dresse à droite du parchemin ; le soleil ou la lune reste
 * visible dans la fenêtre de gauche.
 */
export function ThroneScene() {
  return (
    <>
      <CastleScene />
      <g transform="translate(1180 330) scale(1.45)">
        {/* Estrade et tapis. */}
        <path d="M-40,300 v-26 h300 v26 Z" fill="#5e412a" />
        <path d="M-20,274 v-16 h260 v16 Z" fill="#6b4a2f" />
        <path
          d="M44,200 V70 Q44,30 110,14 Q176,30 176,70 V200 Z"
          fill="#c9a227"
          stroke="#7a5e10"
          strokeWidth={3}
        />
        <path d="M58,196 V76 Q58,46 110,32 Q162,46 162,76 V196 Z" fill="#8f2d2d" />
        <path d="M110,52 l10,18 -10,18 -10,-18 Z" fill="#e0b23a" opacity={0.85} />
        <rect
          x={30}
          y={180}
          width={30}
          height={78}
          rx={6}
          fill="#a88220"
          stroke="#7a5e10"
          strokeWidth={3}
        />
        <rect
          x={160}
          y={180}
          width={30}
          height={78}
          rx={6}
          fill="#a88220"
          stroke="#7a5e10"
          strokeWidth={3}
        />
        <rect
          x={52}
          y={196}
          width={116}
          height={30}
          rx={8}
          fill="#a33434"
          stroke="#6b1f1f"
          strokeWidth={3}
        />
        <rect x={58} y={226} width={104} height={32} fill="#7a5638" />
        <g className="castle-crown">
          <path
            d="M80,198 l-4,-30 14,14 20,-24 20,24 14,-14 -4,30 Z"
            fill="#f2c94c"
            stroke="#8a6a14"
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <rect
            x={80}
            y={192}
            width={60}
            height={10}
            rx={2}
            fill="#e0b23a"
            stroke="#8a6a14"
            strokeWidth={2}
          />
          <circle cx={110} cy={146} r={5} fill="#d64545" />
        </g>
      </g>
      <WallTorch x={1520} y={420} />
    </>
  )
}
