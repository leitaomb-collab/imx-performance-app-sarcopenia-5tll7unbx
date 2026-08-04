import { memo } from 'react'
import { cn } from '@/lib/utils'

type LogoSize = 'sm' | 'md' | 'lg'

interface LogoProps {
  size?: LogoSize
  className?: string
}

const sizeConfig: Record<
  LogoSize,
  {
    top: string
    bottom: string
    circle: string
    circleMargin: string
  }
> = {
  sm: { top: 'text-base', bottom: 'text-[8px]', circle: 'h-1 w-1', circleMargin: 'mb-0.5' },
  md: { top: 'text-xl', bottom: 'text-[10px]', circle: 'h-[5px] w-[5px]', circleMargin: 'mb-1' },
  lg: { top: 'text-3xl', bottom: 'text-xs', circle: 'h-[7px] w-[7px]', circleMargin: 'mb-1.5' },
}

function LogoComponent({ size = 'md', className }: LogoProps) {
  const config = sizeConfig[size]
  return (
    <div
      className={cn('flex flex-col items-center leading-none', className)}
      aria-label="IEMEX Performance"
      role="img"
    >
      <span className={cn('font-bold text-current', config.top)}>
        IEME
        <span className="relative inline-block">
          X
          <span
            className={cn(
              'absolute left-1/2 -translate-x-1/2 rounded-full bg-current',
              config.circle,
              config.circleMargin,
              'bottom-full',
            )}
          />
        </span>
      </span>
      <span className={cn('uppercase font-normal tracking-[0.3em] text-current', config.bottom)}>
        PERFORMANCE
      </span>
    </div>
  )
}

export const Logo = memo(LogoComponent)
export default Logo
