/** Assombrissement des bords de la scène, qui ramène le regard vers le centre ; teinte réglable. */
export function Vignette({
  color = '#000',
  strength = 0.55,
}: {
  color?: string
  strength?: number
}) {
  return (
    <g>
      <defs>
        <radialGradient id="place-vignette" cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.55" stopColor={color} stopOpacity="0" />
          <stop offset="1" stopColor={color} stopOpacity={strength} />
        </radialGradient>
      </defs>
      <rect className="place-vignette" width={1600} height={900} fill="url(#place-vignette)" />
    </g>
  )
}
