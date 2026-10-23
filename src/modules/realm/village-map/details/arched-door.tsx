/**
 * Porte cintrée de largeur w et de hauteur h, posée au sol à l'origine du repère où elle est
 * dessinée : à placer dans un OnFace pour qu'elle suive la perspective du mur.
 */
export function ArchedDoor({
  w,
  h,
  color,
  frame,
}: {
  w: number
  h: number
  color: string
  frame?: string
}) {
  const r = w / 2
  const d = `M${-r},0 L${-r},${-(h - r)} Q${-r},${-h} 0,${-h} Q${r},${-h} ${r},${-(h - r)} L${r},0 Z`
  return (
    <path d={d} fill={color} stroke={frame} strokeWidth={frame ? 2 : 0} className="vmap-door" />
  )
}
