import type React from 'react'
import { cn } from '#/lib/utils'

export interface AnimatedNumberProps {
  value: string | number
  className?: string
}

/**
 * AnimatedNumber renders a numerical metric with transitions.dev number pop-in animations.
 * Applies individual digit blurring, vertical travel, and bounded staggers on trailing digits.
 */
export function AnimatedNumber({
  value,
  className,
}: AnimatedNumberProps): React.ReactElement {
  const str = String(value)
  const chars = str.split('')

  return (
    <span
      className={cn('t-digit-group is-animating', className)}
      aria-label={str}
    >
      {chars.map((char, index) => {
        let stagger: string | undefined
        if (index === chars.length - 2) stagger = '1'
        if (index === chars.length - 1) stagger = '2'

        return (
          <span
            key={`${index}-${char}`}
            className="t-digit"
            data-stagger={stagger}
            aria-hidden="true"
          >
            {char}
          </span>
        )
      })}
    </span>
  )
}
