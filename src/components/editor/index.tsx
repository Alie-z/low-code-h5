import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent, 
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useState } from 'react'
import ComponentPanel from './ComponentPanel'
import Canvas from './Canvas'
import PropertyPanel from './PropertyPanel'
import Toolbar from './Toolbar'
import useBuilderStore from '@/store/builder'
import registry from '@/core/registry'
import type { DragData } from '@/types'

/**
 * 拖拽预览组件 - 新建组件
 */
function NewComponentPreview({ componentType }: { componentType: string }) {
  const meta = registry.getComponent(componentType)
  if (!meta) return null

  return (
    <div className="bg-white border-2 border-primary-400 rounded-lg p-4 shadow-lg opacity-90">
      <span className="text-2xl mr-2">{meta.icon}</span>
      <span className="text-sm font-medium">{meta.name}</span>
    </div>
  )
}

/**
 * 拖拽预览组件 - 移动组件
 */
function MoveComponentPreview({ componentId }: { componentId: string }) {
  const { findComponentById } = useBuilderStore()
  const component = findComponentById(componentId)
  
  if (!component) return null
  
  const meta = registry.getComponent(component.type)
  if (!meta) return null

  return (
    <div className="bg-primary-50 border-2 border-primary-500 rounded-lg p-4 shadow-xl opacity-95">
      <span className="text-2xl mr-2">{meta.icon}</span>
      <span className="text-sm font-medium text-primary-700">{meta.name}</span>
      <span className="ml-2 text-xs text-primary-500">移动中...</span>
    </div>
  )
}

/**
 * 编辑器主组件
 */
export default function Editor() {
  const { addComponent, moveComponent, previewMode, currentPage } = useBuilderStore()
  const [activeDragData, setActiveDragData] = useState<DragData | null>(null)

  // 配置传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 需要移动8px才触发拖拽，避免点击误触
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DragData
    setActiveDragData(data)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragData(null)
    
    const { active, over } = event
    if (!over) return

    const dragData = active.data.current as DragData

    // 新组件拖拽
    if (dragData?.type === 'new' && dragData.componentType) {
      const overId = over.id as string
      
      if (overId === 'canvas-root') {
        // 拖拽到画布根节点
        addComponent(dragData.componentType)
      } else if (overId.startsWith('container-')) {
        // 拖拽到容器组件
        const containerId = overId.replace('container-', '')
        addComponent(dragData.componentType, containerId)
      } else {
        // 拖拽到其他组件位置 - 插入到该组件之后
        const overData = over.data.current as DragData
        if (overData?.type === 'move' && overData.componentId) {
          // 找到目标组件的索引，插入到其后面
          const targetIndex = currentPage.components.findIndex(c => c.id === overData.componentId)
          if (targetIndex !== -1) {
            addComponent(dragData.componentType, overData.parentId ?? undefined, targetIndex + 1)
          } else {
            addComponent(dragData.componentType)
          }
        }
      }
    }

    // 已有组件排序
    if (dragData?.type === 'move' && dragData.componentId) {
      const activeId = dragData.componentId
      const overId = over.id as string
      
      if (activeId === overId) return // 没有移动

      const overData = over.data.current as DragData
      
      // 计算新位置
      if (overId === 'canvas-root') {
        // 移动到画布末尾
        moveComponent(activeId, null, currentPage.components.length)
      } else if (overData?.type === 'move' && overData.componentId) {
        // 移动到其他组件位置
        const oldIndex = currentPage.components.findIndex(c => c.id === activeId)
        const newIndex = currentPage.components.findIndex(c => c.id === overId)
        
        if (oldIndex !== -1 && newIndex !== -1) {
          // 计算实际插入位置
          const insertIndex = oldIndex < newIndex ? newIndex : newIndex
          moveComponent(activeId, overData.parentId ?? null, insertIndex)
        }
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-gray-50">
        <Toolbar />
        <div className="flex-1 flex overflow-hidden">
          {!previewMode && <ComponentPanel />}
          <Canvas />
          {!previewMode && <PropertyPanel />}
        </div>
      </div>

      <DragOverlay>
        {activeDragData?.type === 'new' && activeDragData.componentType && (
          <NewComponentPreview componentType={activeDragData.componentType} />
        )}
        {activeDragData?.type === 'move' && activeDragData.componentId && (
          <MoveComponentPreview componentId={activeDragData.componentId} />
        )}
      </DragOverlay>
    </DndContext>
  )
}

export { ComponentPanel, Canvas, PropertyPanel, Toolbar }