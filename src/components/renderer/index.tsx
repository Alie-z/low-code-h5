import type { ComponentInstance } from '@/types'
import MaterialButton from './MaterialButton'
import MaterialText from './MaterialText'
import MaterialImage from './MaterialImage'
import MaterialContainer from './MaterialContainer'
import MaterialDivider from './MaterialDivider'
import MaterialCarousel from './MaterialCarousel'
import MaterialCountdown from './MaterialCountdown'
import MaterialProductCard from './MaterialProductCard'

/**
 * 组件类型到React组件的映射
 */
const componentMap: Record<string, React.ComponentType<any>> = {
  button: MaterialButton,
  text: MaterialText,
  image: MaterialImage,
  container: MaterialContainer,
  divider: MaterialDivider,
  carousel: MaterialCarousel,
  countdown: MaterialCountdown,
  productCard: MaterialProductCard
}

/**
 * 获取组件渲染器
 */
export function getComponentRenderer(type: string): React.ComponentType<any> | null {
  return componentMap[type] || null
}

/**
 * 渲染组件实例
 */
interface ComponentRendererProps {
  instance: ComponentInstance
  onEvent?: (eventType: string, componentId: string) => void
}

export function ComponentRenderer({ instance, onEvent }: ComponentRendererProps) {
  const Component = getComponentRenderer(instance.type)
  
  if (!Component) {
    return (
      <div className="p-4 bg-red-50 text-red-500 text-sm rounded">
        未知组件类型: {instance.type}
      </div>
    )
  }

  // 为所有可能的事件创建处理器
  // 当有绑定的事件时触发 onEvent 回调
  const createEventHandler = (eventType: string) => () => {
    // 检查是否有该事件类型的绑定
    const hasBinding = instance.events?.some(e => e.eventType === eventType)
    if (hasBinding) {
      onEvent?.(eventType, instance.id)
    }
  }

  // 渲染子组件
  const children = instance.children?.map(child => (
    <ComponentRenderer 
      key={child.id} 
      instance={child} 
      onEvent={onEvent}
    />
  ))

  return (
    <Component
      {...instance.props}
      style={instance.style}
      onClick={createEventHandler('onClick')}
      onChange={createEventHandler('onChange')}
      onLoad={createEventHandler('onLoad')}
      onError={createEventHandler('onError')}
      onEnd={createEventHandler('onEnd')}
      onBuy={createEventHandler('onBuy')}
    >
      {children}
    </Component>
  )
}

export {
  MaterialButton,
  MaterialText,
  MaterialImage,
  MaterialContainer,
  MaterialDivider,
  MaterialCarousel,
  MaterialCountdown,
  MaterialProductCard
}