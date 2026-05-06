export type IllustrationMode =
  | { type: 'fixed-width'; widthPx: number }
  | { type: 'vertical-fit'; topGapPx: number }

interface ComputeIllustrationBoxInput {
  canvasWidth: number
  ribbonTop: number
  assetWidth: number
  assetHeight: number
  bottomAnchor: number
  centerXAnchor: number
  mode: IllustrationMode
}

export interface IllustrationBox {
  x: number
  y: number
  width: number
  height: number
}

export function computeIllustrationBox({
  canvasWidth,
  ribbonTop,
  assetWidth,
  assetHeight,
  bottomAnchor,
  centerXAnchor,
  mode,
}: ComputeIllustrationBoxInput): IllustrationBox {
  const safeBottomAnchor = bottomAnchor > 0 ? bottomAnchor : 1
  const height =
    mode.type === 'vertical-fit'
      ? Math.round((ribbonTop - mode.topGapPx) / safeBottomAnchor)
      : Math.round((mode.widthPx * assetHeight) / assetWidth)
  const width =
    mode.type === 'vertical-fit' ? Math.round((height * assetWidth) / assetHeight) : mode.widthPx
  const y =
    mode.type === 'vertical-fit' ? mode.topGapPx : ribbonTop - Math.round(height * safeBottomAnchor)

  return {
    x: Math.round(canvasWidth / 2 - centerXAnchor * width),
    y,
    width,
    height,
  }
}
