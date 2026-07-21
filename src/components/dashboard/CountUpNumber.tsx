import { useCountUp } from '@/hooks/use-count-up'

interface CountUpNumberProps {
  target: number
  duration?: number
  delay?: number
}

export function CountUpNumber({ target, duration = 800, delay = 0 }: CountUpNumberProps) {
  const value = useCountUp(target, duration, delay)
  return <>{value}</>
}
