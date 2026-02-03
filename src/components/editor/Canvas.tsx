import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useState, useCallback } from 'react'
import { clsx } from 'clsx'
import useBuilderStore from '@/store/builder'
import type { ComponentInstance, DragData } from '@/types'
import { ComponentRenderer } from '@/components/renderer'
import eventEngine from '@/core/eventEngine'

/**
 * 可排序的组件包装器
 */
function SortableComponentWrapper({ 
  instance, 
  children,
  parentId
}: { 
  instance: ComponentInstance
  children: React.ReactNode 
  parentId?: string
}) {
  const { 
    selectedComponentIds, 
    hoveredComponentId,
    selectComponent, 
    setHoveredComponent,
    previewMode
  } = useBuilderStore()

  const isSelected = selectedComponentIds.includes(instance.id)
  const isHovered = hoveredComponentId === instance.id && !isSelected

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: instance.id,
    data: {
      type: 'move',
      componentId: instance.id,
      parentId
    } as DragData
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : undefined
  }

  if (previewMode) {
    return <>{children}</>
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'relative group cursor-move transition-all',
        isSelected && 'ring-2 ring-primary-500 ring-offset-1',
        isHovered && 'ring-1 ring-primary-300 ring-offset-1',
        isDragging && 'shadow-lg'
      )}
      onClick={(e) => {
        e.stopPropagation()
        selectComponent(instance.id, e.metaKey || e.ctrlKey)
      }}
      onMouseEnter={() => setHoveredComponent(instance.id)}
      onMouseLeave={() => setHoveredComponent(null)}
      {...attributes}
      {...listeners}
    >
      {/* 组件类型标签 */}
      {(isSelected || isHovered) && (
        <div className="absolute -top-6 left-0 bg-primary-500 text-white text-xs px-2 py-0.5 rounded text-nowrap z-10">
          {instance.type}
          <span className="ml-1 opacity-70">⋮⋮</span>
        </div>
      )}
      
      {/* 禁止组件内部交互 */}
      <div className="pointer-events-none">
        {children}
      </div>
    </div>
  )
}

/**
 * 可排序的组件列表
 */
function SortableComponentList({ 
  components, 
  parentId,
  onEvent 
}: { 
  components: ComponentInstance[]
  parentId?: string
  onEvent?: (eventType: string, componentId: string) => void
}) {
  const { previewMode } = useBuilderStore()
  const componentIds = components.map(c => c.id)

  return (
    <SortableContext items={componentIds} strategy={verticalListSortingStrategy}>
      {components.map(instance => {
        // 预览模式下，隐藏的组件不渲染
        if (instance.hidden && previewMode) {
          return null
        }

        const rendered = (
          <ComponentRenderer 
            instance={instance} 
            onEvent={onEvent}
          />
        )

        if (previewMode) {
          return <div key={instance.id}>{rendered}</div>
        }

        // 编辑模式下，隐藏的组件以半透明方式显示
        return (
          <SortableComponentWrapper 
            key={instance.id} 
            instance={instance}
            parentId={parentId}
          >
            <div className={instance.hidden ? 'opacity-30' : ''}>
              {rendered}
            </div>
          </SortableComponentWrapper>
        )
      })}
    </SortableContext>
  )
}

/**
 * 设备尺寸配置
 */
const deviceSizes = {
  mobile: { width: 375, label: '手机' },
  tablet: { width: 768, label: '平板' },
  desktop: { width: 1024, label: '桌面' }
}

/**
 * 消息提示组件
 */
function Toast({ 
  message, 
  type, 
  onClose 
}: { 
  message: string
  type: 'info' | 'success' | 'error'
  onClose: () => void 
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500'
  }

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 ${bgColor[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse`}>
      {message}
    </div>
  )
}

/**
 * 画布组件
 */
export default function Canvas() {
  const { 
    currentPage, 
    selectedComponentIds, 
    previewMode, 
    zoom,
    deviceMode,
    clearSelection,
    findComponentById,
    updateComponentProps,
    setComponentHidden
  } = useBuilderStore()

  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null)

  // 初始化事件引擎上下文
  useEffect(() => {
    eventEngine.setContext({
      findComponent: findComponentById,
      updateComponentProps,
      setComponentHidden,
      navigate: (url: string) => {
        if (previewMode) {
          window.open(url, '_blank')
        } else {
          setToast({ message: `将跳转到: ${url}`, type: 'info' })
        }
      },
      showMessage: (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        setToast({ message, type })
      }
    })
  }, [findComponentById, updateComponentProps, setComponentHidden, previewMode])

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-root',
    data: {
      type: 'canvas'
    }
  })

  const handleCanvasClick = () => {
    if (selectedComponentIds.length > 0) {
      clearSelection()
    }
  }

  // 处理组件事件 - 使用事件引擎执行
  const handleEvent = useCallback((eventType: string, componentId: string) => {
    const component = findComponentById(componentId)
    if (component) {
      console.log(`Event triggered: ${eventType} from component: ${componentId}`)
      eventEngine.executeEvent(eventType, component)
    }
  }, [findComponentById])

  const deviceWidth = deviceSizes[deviceMode].width

  return (
    <>
      <div className="flex-1 bg-gray-100 overflow-auto p-8">
        <div className="flex justify-center">
          <div
            ref={setNodeRef}
            className={clsx(
              'bg-white shadow-lg transition-all duration-300 relative',
              isOver && 'ring-2 ring-primary-400 ring-dashed'
            )}
            style={{
              width: deviceWidth,
              minHeight: 600,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              ...currentPage.globalStyles
            }}
            onClick={handleCanvasClick}
          >
            {currentPage.components.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <span className="text-4xl mb-4">📱</span>
                <span className="text-sm">拖拽组件到此处开始搭建</span>
              </div>
            ) : (
              <SortableComponentList 
                components={currentPage.components}
                onEvent={handleEvent}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* 消息提示 */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  )
}