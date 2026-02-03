interface MaterialDividerProps {
  type?: 'solid' | 'dashed' | 'dotted'
  text?: string
  orientation?: 'left' | 'center' | 'right'
  style?: React.CSSProperties
}

export default function MaterialDivider({
  type = 'solid',
  text,
  orientation = 'center',
  style
}: MaterialDividerProps) {
  if (!text) {
    return (
      <hr
        className="border-gray-200 my-4"
        style={{
          borderStyle: type,
          ...style
        }}
      />
    )
  }

  const justifyClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }

  return (
    <div 
      className={`flex items-center my-4 ${justifyClass[orientation]}`}
      style={style}
    >
      {orientation !== 'left' && (
        <div 
          className="flex-1 border-t border-gray-200"
          style={{ borderStyle: type, maxWidth: orientation === 'center' ? undefined : '20px' }}
        />
      )}
      <span className="px-3 text-gray-500 text-sm whitespace-nowrap">{text}</span>
      {orientation !== 'right' && (
        <div 
          className="flex-1 border-t border-gray-200"
          style={{ borderStyle: type, maxWidth: orientation === 'center' ? undefined : '20px' }}
        />
      )}
    </div>
  )
}