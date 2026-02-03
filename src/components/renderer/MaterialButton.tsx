import { clsx } from 'clsx'

interface MaterialButtonProps {
  text?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'text'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  block?: boolean
  style?: React.CSSProperties
  onClick?: () => void
}

const sizeClasses = {
  small: 'px-3 py-1 text-sm',
  medium: 'px-4 py-2 text-base',
  large: 'px-6 py-3 text-lg'
}

const variantClasses = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 border-transparent',
  secondary: 'bg-gray-500 text-white hover:bg-gray-600 border-transparent',
  outline: 'bg-transparent text-primary-500 border-primary-500 hover:bg-primary-50',
  text: 'bg-transparent text-primary-500 border-transparent hover:bg-primary-50'
}

export default function MaterialButton({
  text = '按钮',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  block = false,
  style,
  onClick
}: MaterialButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-md border font-medium transition-colors duration-200',
        sizeClasses[size],
        variantClasses[variant],
        block && 'w-full',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      style={style}
      disabled={disabled}
      onClick={onClick}
    >
      {text}
    </button>
  )
}