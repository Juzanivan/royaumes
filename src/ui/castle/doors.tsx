/**
 * Portes de la grande salle du château, dessinées en SVG. Chacune est l'image d'un lien de
 * l'écran du château : elle ne porte aucun comportement, et n'est lue par aucun lecteur d'écran.
 */

/** Ferrures d'un battant : deux pentures et un anneau. */
function Ironwork({ x, w, ring }: { x: number; w: number; ring: number }) {
  return (
    <g fill="none" stroke="#2b2622" strokeWidth={6} strokeLinecap="round">
      <path d={`M${x + 8},120 h${w - 16} M${x + 8},230 h${w - 16}`} />
      <circle cx={ring} cy={180} r={11} />
    </g>
  )
}

/** Porte des archives : un lourd portail cintré à deux battants, cerclé de fer. */
export function ArchivesDoor() {
  return (
    <svg viewBox="0 0 200 300" className="castle-door-art" aria-hidden="true">
      <path d="M10,300 V100 A90,90 0 0 1 190,100 V300 Z" fill="#3b3440" />
      <path d="M24,300 V104 A76,76 0 0 1 176,104 V300 Z" fill="#7a4f2c" />
      <g stroke="#5e3b20" strokeWidth={3}>
        {[44, 64, 84, 116, 136, 156].map((x) => (
          <line key={x} x1={x} y1={60} x2={x} y2={300} />
        ))}
      </g>
      <line x1={100} y1={28} x2={100} y2={300} stroke="#3b2414" strokeWidth={5} />
      <Ironwork x={24} w={76} ring={84} />
      <Ironwork x={100} w={76} ring={116} />
      <path
        d="M70,62 h60 v36 h-60 Z"
        fill="#e8dcc0"
        stroke="#5e3b20"
        strokeWidth={3}
        className="castle-door-plate"
      />
      <path d="M84,72 h32 M84,80 h32 M84,88 h22" stroke="#8c7a5c" strokeWidth={3} />
    </svg>
  )
}

/** Maillons d'une chaîne tendue de (x1, y1) à (x2, y2). */
function Chain({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const count = 9
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
  return (
    <g>
      {Array.from({ length: count }, (_, i) => i / (count - 1)).map((t, i) => (
        <ellipse
          key={t}
          cx={x1 + (x2 - x1) * t}
          cy={y1 + (y2 - y1) * t}
          rx={9}
          ry={i % 2 ? 3 : 5}
          fill="none"
          stroke="#9a9a9a"
          strokeWidth={3.5}
          transform={`rotate(${angle} ${x1 + (x2 - x1) * t} ${y1 + (y2 - y1) * t})`}
        />
      ))}
    </g>
  )
}

/**
 * Porte de la sortie : la même porte cintrée que celle des archives, condamnée par deux chaînes
 * croisées et un gros cadenas. La franchir, c'est quitter le royaume (se déconnecter).
 */
export function ChainedDoor() {
  return (
    <svg viewBox="0 0 200 300" className="castle-door-art" aria-hidden="true">
      <path d="M10,300 V100 A90,90 0 0 1 190,100 V300 Z" fill="#3b3440" />
      <path d="M24,300 V104 A76,76 0 0 1 176,104 V300 Z" fill="#5e3d27" />
      <g stroke="#45291a" strokeWidth={3}>
        {[44, 64, 84, 116, 136, 156].map((x) => (
          <line key={x} x1={x} y1={60} x2={x} y2={300} />
        ))}
      </g>
      <line x1={100} y1={28} x2={100} y2={300} stroke="#2e1b10" strokeWidth={5} />
      <path d="M32,120 h136 M32,240 h136" stroke="#2b2622" strokeWidth={6} strokeLinecap="round" />
      {/* Crampons scellés dans l'embrasure, et chaînes croisées. */}
      {[
        [28, 110],
        [172, 110],
        [28, 250],
        [172, 250],
      ].map(([x, y]) => (
        <circle
          key={`${x},${y}`}
          cx={x}
          cy={y}
          r={7}
          fill="#5b5b5b"
          stroke="#2b2b2b"
          strokeWidth={2}
        />
      ))}
      <Chain x1={28} y1={110} x2={172} y2={250} />
      <Chain x1={172} y1={110} x2={28} y2={250} />
      {/* Cadenas, au croisement des chaînes. */}
      <g className="castle-padlock">
        <path d="M86,178 v-14 a14,14 0 0 1 28,0 v14" fill="none" stroke="#8a8a8a" strokeWidth={6} />
        <rect
          x={78}
          y={176}
          width={44}
          height={38}
          rx={6}
          fill="#c9a227"
          stroke="#7a5e10"
          strokeWidth={3}
        />
        <circle cx={100} cy={192} r={5} fill="#3a2a08" />
        <path d="M100,195 v10" stroke="#3a2a08" strokeWidth={4} strokeLinecap="round" />
      </g>
    </svg>
  )
}

/**
 * Trône du seigneur, au bout du tapis rouge : un haut dossier de velours rouge dans un cadre
 * doré, et la couronne posée sur le siège.
 */
export function Throne() {
  return (
    <svg viewBox="0 0 220 300" className="castle-door-art castle-throne-art" aria-hidden="true">
      {/* Estrade. */}
      <path d="M8,300 v-22 h204 v22 Z" fill="#6b4a2f" />
      <path d="M22,278 v-14 h176 v14 Z" fill="#7a5638" />
      {/* Dossier : cadre doré, velours, fleurons. */}
      <path
        d="M44,200 V70 Q44,30 110,14 Q176,30 176,70 V200 Z"
        fill="#c9a227"
        stroke="#7a5e10"
        strokeWidth={3}
      />
      <path d="M58,196 V76 Q58,46 110,32 Q162,46 162,76 V196 Z" fill="#8f2d2d" />
      <path d="M110,52 l10,18 -10,18 -10,-18 Z" fill="#e0b23a" opacity={0.85} />
      <circle cx={44} cy={70} r={8} fill="#e0b23a" stroke="#7a5e10" strokeWidth={2} />
      <circle cx={176} cy={70} r={8} fill="#e0b23a" stroke="#7a5e10" strokeWidth={2} />
      {/* Accoudoirs et siège. */}
      <rect
        x={30}
        y={180}
        width={30}
        height={84}
        rx={6}
        fill="#a88220"
        stroke="#7a5e10"
        strokeWidth={3}
      />
      <rect
        x={160}
        y={180}
        width={30}
        height={84}
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
      <rect x={58} y={226} width={104} height={38} fill="#7a5638" />
      {/* Couronne posée sur le siège. */}
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
        <circle cx={96} cy={197} r={3.5} fill="#3e7bd6" />
        <circle cx={124} cy={197} r={3.5} fill="#3ea86b" />
        <circle cx={110} cy={197} r={3.5} fill="#d64545" />
      </g>
    </svg>
  )
}
