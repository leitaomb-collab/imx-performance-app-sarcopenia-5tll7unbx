import { useState, useEffect, useRef, type ReactNode } from 'react'

interface VirtualizedGridProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  itemHeight: number
  columns: number
  buffer?: number
  className?: string
}

export function VirtualizedGrid<T>({
  items,
  renderItem,
  itemHeight,
  columns,
  buffer = 5,
  className,
}: VirtualizedGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(800)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleScroll = () => setScrollTop(el.scrollTop)
    const ro = new ResizeObserver(() => setViewportHeight(el.clientHeight))
    ro.observe(el)
    setViewportHeight(el.clientHeight)
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', handleScroll)
      ro.disconnect()
    }
  }, [])

  const totalRows = Math.ceil(items.length / columns)
  const totalHeight = totalRows * itemHeight
  const startRow = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
  const endRow = Math.min(totalRows, Math.ceil((scrollTop + viewportHeight) / itemHeight) + buffer)

  const nodes: ReactNode[] = []
  for (let row = startRow; row < endRow; row++) {
    for (let col = 0; col < columns; col++) {
      const index = row * columns + col
      if (index < items.length) {
        nodes.push(
          <div
            key={index}
            style={{
              position: 'absolute',
              top: row * itemHeight,
              left: `${(col / columns) * 100}%`,
              width: `${100 / columns}%`,
              height: itemHeight,
              padding: '0.5rem',
              boxSizing: 'border-box',
            }}
          >
            {renderItem(items[index], index)}
          </div>,
        )
      }
    }
  }

  return (
    <div ref={containerRef} className={className} style={{ height: '70vh', overflow: 'auto' }}>
      <div style={{ position: 'relative', height: totalHeight }}>{nodes}</div>
    </div>
  )
}
