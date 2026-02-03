import { clsx } from 'clsx'

interface MaterialTextProps {
  content?: string
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption'
  align?: 'left' | 'center' | 'right'
  style?: React.CSSProperties
  onClick?: () => void
}

const variantClasses = {
  h1: 'text-3xl font-bold',
  h2: 'text-2xl font-semibold',
  h3: 'text-xl font-medium',
  body: 'text-base',
  caption: 'text-sm text-gray-500'
}

export default function MaterialText({
  content = '文本内容',
  variant = 'body',
  align = 'left',
  style,
  onClick
}: MaterialTextProps) {
  const Tag = variant.startsWith('h') ? variant as 'h1' | 'h2' | 'h3' : 'p'
  
  return (
    <Tag
      className={clsx(
        variantClasses[variant],
        `text-${align}`
      )}
      style={{ textAlign: align, ...style }}
      onClick={onClick}
    >
      {content}
    </Tag>
  )
}