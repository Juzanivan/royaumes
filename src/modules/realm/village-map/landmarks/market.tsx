import { MarketStall } from '../details/market-stall'

/** Marché : trois étals aux auvents de couleurs différentes, garnis de marchandises. */
export function Market({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <MarketStall
        x={x - 0.55}
        y={y - 0.45}
        color="#3d6fb5"
        goods={['#e8b93c', '#c2412d', '#e8b93c']}
      />
      <MarketStall
        x={x + 0.35}
        y={y - 0.35}
        color="#3f7d3a"
        goods={['#b07a46', '#b07a46', '#9b958c']}
      />
      <MarketStall
        x={x - 0.15}
        y={y + 0.5}
        color="#c2412d"
        goods={['#7cb342', '#f4a742', '#e45050']}
      />
    </g>
  )
}
