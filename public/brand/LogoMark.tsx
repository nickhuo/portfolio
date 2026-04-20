import * as React from 'react'

type LogoMarkProps = {
  size?: number
  className?: string
  /** override color; defaults to currentColor so dark/light mode just works */
  color?: string
}

/**
 * /n — brand mark for nickhuo.com
 * 48×48 grid. Filled shapes, no strokes. Uses currentColor so it
 * inherits text color (light: #111110, dark: #ffffff).
 */
export function LogoMark({ size = 28, className, color = 'currentColor' }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Nick Huo"
      role="img"
    >
      {/* italic slash */}
      <path d="M20 6 L24 6 L16 42 L12 42 Z" fill={color} />
      {/* lowercase n */}
      <path
        d="M26 18 L32 18 L32 21.5 C33.6 19.3 35.9 18 38.7 18 C43.2 18 46 21 46 25.5 L46 42 L40 42 L40 26.5 C40 24 38.8 22.5 36.6 22.5 C34.2 22.5 32 24.4 32 27.5 L32 42 L26 42 Z"
        fill={color}
      />
    </svg>
  )
}
