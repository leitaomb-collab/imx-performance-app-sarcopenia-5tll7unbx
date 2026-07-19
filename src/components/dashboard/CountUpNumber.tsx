import { useCountUp } from '@/hooks/use-count-up'

interface CountUpNumberProps {
  target: number
  duration?: number
}

export function CountUpNumber({ target, duration = 800 }: CountUpNumberProps) {
  const value = useCountUp(target, duration)
  return <>{value}</>
}
