interface MaterialProductCardProps {
  image?: string
  title?: string
  price?: number
  originalPrice?: number
  tag?: string
  style?: React.CSSProperties
  onClick?: () => void
  onBuy?: () => void
}

export default function MaterialProductCard({
  image = 'https://via.placeholder.com/200x200',
  title = '商品名称',
  price = 99,
  originalPrice = 199,
  tag = '热销',
  style,
  onClick,
  onBuy
}: MaterialProductCardProps) {
  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
      style={style}
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-40 object-cover"
        />
        {tag && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            {tag}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
          {title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-red-500 text-lg font-bold">¥{price}</span>
            {originalPrice > price && (
              <span className="text-gray-400 text-xs line-through">¥{originalPrice}</span>
            )}
          </div>
          <button
            className="bg-red-500 text-white text-xs px-3 py-1 rounded-full hover:bg-red-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onBuy?.()
            }}
          >
            购买
          </button>
        </div>
      </div>
    </div>
  )
}