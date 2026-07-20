import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function ShortcutHintBar({ hidden }: { hidden: boolean }) {
  const [isMac, setIsMac] = useState(false)
  const [isCoarse, setIsCoarse] = useState(false)
  useEffect(() => {
    setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.platform))
    setIsCoarse(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  if (isCoarse) return null

  const mod = isMac ? '⌘' : 'Ctrl'
  const items = [
    { keys: ['←', '→'], label: 'Navegar' },
    { keys: [mod, 'S'], label: 'Salvar rascunho' },
    { keys: [mod, '↵'], label: 'Finalizar' },
    { keys: ['Esc'], label: 'Fechar' },
  ]
  return (
    <div
      className={cn(
        'hidden md:flex items-center gap-3 px-3 py-1.5 bg-secondary border rounded-md text-[0.75rem] text-muted-foreground transition-opacity duration-200',
        hidden ? 'opacity-0' : 'opacity-60 hover:opacity-100',
      )}
    >
      {items.map((s, i) => (
        <div key={i} className="flex items-center gap-1">
          {s.keys.map((k, j) => (
            <kbd
              key={j}
              className="px-1 py-0.5 bg-background border rounded text-[0.75rem] font-mono"
            >
              {k}
            </kbd>
          ))}
          <span>{s.label}</span>
          {i < items.length - 1 && <span className="text-border mx-1">·</span>}
        </div>
      ))}
    </div>
  )
}
