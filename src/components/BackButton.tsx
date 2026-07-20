import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useTransitionNavigate } from '@/hooks/use-transition-navigate'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  fallback: string
  label?: string
  variant?: 'ghost' | 'outline' | 'secondary' | 'default' | 'destructive' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function BackButton({
  fallback,
  label = 'Voltar',
  variant = 'ghost',
  size,
  className,
}: BackButtonProps) {
  const transitionNavigate = useTransitionNavigate()

  const handleBack = () => {
    if (window.history.length > 1) {
      transitionNavigate(-1)
    } else {
      transitionNavigate(fallback)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn('w-fit tactile', className)}
      onClick={handleBack}
      aria-label={label}
    >
      <ArrowLeft className="mr-2 h-4 w-4" /> <span className="report-btn-label">{label}</span>
    </Button>
  )
}
