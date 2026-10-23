'use client'
import { type KeyboardEvent, type MouseEvent, useRef, useState } from 'react'
import { iso } from '../geometry/iso'
import { POND } from '../layout'

/** Demi-axes de la mare, à l'écran. */
const RX = 46
const RY = 20

/** Durée de vie d'un rond dans l'eau, et d'un plouf de poisson, en millisecondes. */
const SPLASH_MS = 1800

/** Nénuphar posé à la surface, au point (x, y), avec ou sans fleur. */
function LilyPad({
  x,
  y,
  r,
  flower = false,
}: {
  x: number
  y: number
  r: number
  flower?: boolean
}) {
  return (
    <g className="vmap-lily">
      <path
        d={`M${x},${y} L${x + r},${y - r * 0.15} A${r},${r * 0.45} 0 1 1 ${x + r * 0.7},${y + r * 0.3} Z`}
        fill="#4f9a4a"
      />
      {flower && (
        <g>
          <ellipse cx={x - 1} cy={y - 3} rx={3.2} ry={2} fill="#f6c6d8" />
          <ellipse cx={x + 1.5} cy={y - 3.5} rx={2.4} ry={1.6} fill="#ffe0ea" />
          <circle cx={x} cy={y - 3.6} r={0.9} fill="#ffd34d" />
        </g>
      )}
    </g>
  )
}

/** Roseaux et massettes au bord de l'eau, au point (x, y). */
function Reeds({ x, y }: { x: number; y: number }) {
  return (
    <g className="vmap-reeds" stroke="#5f7f38" strokeWidth={1.4} strokeLinecap="round">
      <path d={`M${x},${y} q-2,-8 -3,-16`} fill="none" />
      <path d={`M${x + 3},${y} q1,-9 2,-18`} fill="none" />
      <path d={`M${x + 6},${y} q3,-6 6,-12`} fill="none" />
      <rect x={x + 3.6} y={y - 21} width={2.8} height={6} rx={1.4} fill="#7a4e2c" stroke="none" />
      <rect x={x - 4.4} y={y - 18} width={2.6} height={5} rx={1.3} fill="#7a4e2c" stroke="none" />
    </g>
  )
}

/** Canard, dessiné tourné vers la droite, posé sur l'eau au point (0, 0) ; small : un caneton. */
function Duck({ small = false }: { small?: boolean }) {
  const s = small ? 0.55 : 1
  return (
    <g transform={`scale(${s})`}>
      <ellipse cx={0} cy={0.5} rx={7} ry={2} fill="rgb(255 255 255 / 0.35)" />
      <path d="M-6,-1 Q-7,-6 -1,-5 L3,-5 Q6,-5 5,-1 Z" fill={small ? '#f2d16b' : '#b9935a'} />
      <circle cx={4} cy={-7} r={2.6} fill={small ? '#f2d16b' : '#2f6f4a'} />
      <path d="M6.2,-7.4 l3,0.8 l-3,0.8 Z" fill="#f0a030" />
      <circle cx={4.8} cy={-7.6} r={0.6} fill="#1b120c" />
    </g>
  )
}

/** Famille de canards qui fait le tour de la mare : la cane, puis ses deux canetons. */
function Ducks({ px, py }: { px: number; py: number }) {
  const path = `path('M${px - 28},${py} a28,10 0 1,0 56,0 a28,10 0 1,0 -56,0')`
  return (
    <g>
      {[
        { delay: 0, small: false },
        { delay: -1.4, small: true },
        { delay: -2.4, small: true },
      ].map(({ delay, small }) => (
        <g
          key={delay}
          className="vmap-duck"
          style={{ offsetPath: path, animationDelay: `${delay}s` }}
        >
          <g className="vmap-duck-turn" style={{ animationDelay: `${delay}s` }}>
            <g className="vmap-duck-bob">
              <Duck small={small} />
            </g>
          </g>
        </g>
      ))}
    </g>
  )
}

/** Poisson qui saute hors de l'eau, son saut décrit par l'animation CSS. */
function Fish() {
  return (
    <g>
      <path
        d="M-6,0 Q0,-4 6,0 Q0,4 -6,0 Z M-6,0 l-4,-3 l0,6 Z"
        fill="#e0884a"
        stroke="#b5562f"
        strokeWidth={0.6}
      />
      <circle cx={3.5} cy={-0.6} r={0.7} fill="#1b120c" />
    </g>
  )
}

/** Plouf : un poisson jaillit en (x, y), puis des ronds s'élargissent à son point de chute. */
function Splash({ x, y, jump }: { x: number; y: number; jump: boolean }) {
  return (
    <g>
      {jump && (
        <g className="vmap-fish-jump" style={{ transform: `translate(${x}px, ${y}px)` }}>
          <g className="vmap-fish-arc">
            <Fish />
          </g>
        </g>
      )}
      <ellipse className="vmap-splash" cx={x} cy={y} rx={8} ry={3} />
      <ellipse
        className="vmap-splash"
        cx={x}
        cy={y}
        rx={14}
        ry={5}
        style={{ animationDelay: '0.25s' }}
      />
    </g>
  )
}

/** Indique si le point (x, y) de l'écran tombe dans la mare. */
const inPond = (x: number, y: number, px: number, py: number) =>
  ((x - px) / RX) ** 2 + ((y - py) / RY) ** 2 <= 1

/**
 * Mare devant le village, pleine de vie : des nénuphars, des roseaux, une cane et ses canetons
 * qui en font le tour, et un poisson qui saute de temps en temps. La nuit, la lune s'y reflète.
 * Un clic y jette un caillou : des ronds s'élargissent, un poisson jaillit, et les canards
 * protestent. Elle se joue aussi au clavier, comme un bouton.
 */
export function Pond() {
  const [px, py] = iso(...POND)
  const [splashes, setSplashes] = useState<{ id: number; x: number; y: number }[]>([])
  const [quack, setQuack] = useState(0)
  const next = useRef(0)

  const splash = (x: number, y: number) => {
    const id = ++next.current
    setSplashes((list) => [...list.slice(-4), { id, x, y }])
    setQuack(id)
    setTimeout(() => setSplashes((list) => list.filter((s) => s.id !== id)), SPLASH_MS)
    setTimeout(() => setQuack((current) => (current === id ? 0 : current)), 1400)
  }

  const onClick = (e: MouseEvent<SVGGElement>) => {
    const svg = e.currentTarget.ownerSVGElement
    const matrix = svg?.getScreenCTM()?.inverse()
    if (!svg || !matrix) return splash(px, py)
    const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix)
    splash(
      ...((inPond(point.x, point.y, px, py) ? [point.x, point.y] : [px, py]) as [number, number]),
    )
  }
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      splash(px + 10, py + 2)
    }
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: un élément <button> ne peut pas figurer dans un SVG.
    <g
      className="vmap-pond"
      role="button"
      tabIndex={0}
      aria-label="Jeter un caillou dans la mare"
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <defs>
        <radialGradient id="vmap-water" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#9cc8e2" />
          <stop offset="1" stopColor="#4f86ad" />
        </radialGradient>
        <clipPath id="vmap-pond-clip">
          <ellipse cx={px} cy={py} rx={RX} ry={RY} />
        </clipPath>
      </defs>
      <ellipse cx={px} cy={py} rx={RX + 3} ry={RY + 2} fill="#d9c49a" />
      <ellipse cx={px} cy={py} rx={RX} ry={RY} fill="url(#vmap-water)" />
      <g clipPath="url(#vmap-pond-clip)">
        {/* Reflets : le ciel le jour, la lune la nuit. */}
        <ellipse className="vmap-glint" cx={px - 14} cy={py - 8} rx={16} ry={2} />
        <g className="vmap-moon-reflection">
          <ellipse cx={px + 12} cy={py - 4} rx={7} ry={2.4} />
          <ellipse cx={px + 12} cy={py + 1} rx={5} ry={1.4} />
          <ellipse cx={px + 12} cy={py + 5} rx={3} ry={1} />
        </g>
        <ellipse className="vmap-ripple" cx={px - 8} cy={py - 2} rx={14} ry={5} />
        <ellipse
          className="vmap-ripple"
          cx={px + 14}
          cy={py + 4}
          rx={10}
          ry={4}
          style={{ animationDelay: '1.3s' }}
        />
        <LilyPad x={px - 26} y={py + 6} r={7} flower />
        <LilyPad x={px + 28} y={py - 6} r={6} />
        <LilyPad x={px + 20} y={py + 10} r={5} />
        {/* Saut régulier d'un poisson, même sans clic. */}
        <g className="vmap-fish-auto">
          <Splash x={px - 6} y={py + 6} jump />
        </g>
        {splashes.map((s) => (
          <Splash key={s.id} x={s.x} y={s.y} jump />
        ))}
      </g>
      <Ducks px={px} py={py} />
      <Reeds x={px - RX + 2} y={py - 6} />
      <Reeds x={px + RX - 12} y={py - 10} />
      {quack > 0 && (
        <g className="vmap-quack">
          <rect
            x={px + 14}
            y={py - 44}
            width={42}
            height={16}
            rx={8}
            fill="#fffaf0"
            stroke="#4a3626"
            strokeWidth={1}
          />
          <text
            x={px + 35}
            y={py - 33}
            textAnchor="middle"
            fontSize={9}
            fontWeight={700}
            fill="#4a3626"
          >
            Coin !
          </text>
        </g>
      )}
    </g>
  )
}
