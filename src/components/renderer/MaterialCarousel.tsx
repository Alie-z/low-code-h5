import { useState, useEffect, useCallback } from 'react'
import { clsx } from 'clsx'

interface MaterialCarouselProps {
  images?: string
  autoplay?: boolean
  interval?: number
  showDots?: boolean
  style?: React.CSSProperties
  onChange?: (index: number) => void
}

export default function MaterialCarousel({
  images = '',
  autoplay = true,
  interval = 3000,
  showDots = true,
  style,
  onChange
}: MaterialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const imageList = images.split(',').map(s => s.trim()).filter(Boolean)
  
  const goTo = useCallback((index: number) => {
    const newIndex = (index + imageList.length) % imageList.length
    setCurrentIndex(newIndex)
    onChange?.(newIndex)
  }, [imageList.length, onChange])

  const goNext = useCallback(() => {
    goTo(currentIndex + 1)
  }, [currentIndex, goTo])

  useEffect(() => {
    if (!autoplay || imageList.length <= 1) return
    
    const timer = setInterval(goNext, interval)
    return () => clearInterval(timer)
  }, [autoplay, interval, imageList.length, goNext])

  if (imageList.length === 0) {
    return (
      <div 
        className="bg-gray-100 flex items-center justify-center text-gray-400"
        style={{ height: 200, ...style }}
      >
        请配置轮播图片
      </div>
    )
  }

  return (
    <div 
      className="relative overflow-hidden rounded-lg"
      style={{ height: 200, ...style }}
    >
      <div 
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {imageList.map((src, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 w-full h-full"
          >
            <img 
              src={src} 
              alt={`slide-${index}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      
      {/* 左右箭头 */}
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 text-white rounded-full flex items-center justify-center hover:bg-black/50 transition-colors"
        onClick={() => goTo(currentIndex - 1)}
      >
        ‹
      </button>
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 text-white rounded-full flex items-center justify-center hover:bg-black/50 transition-colors"
        onClick={() => goTo(currentIndex + 1)}
      >
        ›
      </button>
      
      {/* 指示器 */}
      {showDots && imageList.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {imageList.map((_, index) => (
            <button
              key={index}
              className={clsx(
                'w-2 h-2 rounded-full transition-colors',
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              )}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}