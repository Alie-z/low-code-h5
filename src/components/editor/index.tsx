import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, pointerWithin } from '@dnd-kit/core'
import { useState } from 'react'
import ComponentPanel from './ComponentPanel'
import Canvas from './Canvas'
import PropertyPanel from './PropertyPanel'
import Toolbar from './Toolbar'
import useBuilderStore from '@/store/builder'
import registry from '@/core/registry'
import type { DragData } from '@/types'

/**
 * 拖拽预览组件
 */
function DragPreview({ componentType }: { componentType: string | null }) {
  if (!componentType) return null

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
 * 编辑器主组件
 */
export default function Editor() {
  const { addComponent, previewMode } = useBuilderStore()
  const [draggedType, setDraggedType] = useState<string | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DragData
    if (data?.type === 'new' && data.componentType) {
      setDraggedType(data.componentType)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedType(null)
    
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
      }
    }
  }

  return (
    <DndContext
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
        <DragPreview componentType={draggedType} />
      </DragOverlay>
    </DndContext>
  )
}

export { ComponentPanel, Canvas, PropertyPanel, Toolbar }