import { clsx } from 'clsx'

interface MaterialContainerProps {
  direction?: 'row' | 'column'
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around'
  align?: 'stretch' | 'flex-start' | 'center' | 'flex-end'
  gap?: number
  wrap?: boolean
  style?: React.CSSProperties
  children?: React.ReactNode
}

export default function MaterialContainer({
  direction = 'column',
  justify = 'flex-start',
  align = 'stretch',
  gap = 8,
  wrap = false,
  style,
  children
}: MaterialContainerProps) {
  return (
    <div
      className={clsx(
        'flex min-h-[60px] p-2',
        wrap && 'flex-wrap'
      )}
      style={{
        flexDirection: direction,
        justifyContent: justify,
        alignItems: align,
        gap: `${gap}px`,
        ...style
      }}
    >
      {children}
    </div>
  )
}