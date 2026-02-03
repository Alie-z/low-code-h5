import { useState } from 'react'
import { clsx } from 'clsx'

interface MaterialImageProps {
  src?: string
  alt?: string
  fit?: 'cover' | 'contain' | 'fill' | 'none'
  link?: string
  style?: React.CSSProperties
  onClick?: () => void
  onLoad?: () => void
  onError?: () => void
}

export default function MaterialImage({
  src = 'https://via.placeholder.com/300x200',
  alt = '图片',
  fit = 'cover',
  link,
  style,
  onClick,
  onLoad,
  onError
}: MaterialImageProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleLoad = () => {
    setLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setLoading(false)
    setError(true)
    onError?.()
  }

  const handleClick = () => {
    if (link) {
      window.open(link, '_blank')
    }
    onClick?.()
  }

  const imageContent = (
    <div 
      className={clsx(
        'relative overflow-hidden bg-gray-100',
        link && 'cursor-pointer'
      )}
      style={{ width: '100%', minHeight: 100, ...style }}
      onClick={handleClick}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
        </div>
      )}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <span>加载失败</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={clsx(
            'w-full h-full transition-opacity duration-300',
            loading ? 'opacity-0' : 'opacity-100'
          )}
          style={{ objectFit: fit }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  )

  return imageContent
}