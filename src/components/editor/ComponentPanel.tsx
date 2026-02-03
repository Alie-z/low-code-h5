import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import registry from '@/core/registry'
import type { ComponentMeta, DragData } from '@/types'

/**
 * 可拖拽的组件项
 */
function DraggableComponent({ meta }: { meta: ComponentMeta }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `new-${meta.type}`,
    data: {
      type: 'new',
      componentType: meta.type
    } as DragData
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-primary-400 hover:shadow-sm transition-all"
    >
      <span className="text-2xl mb-1">{meta.icon}</span>
      <span className="text-xs text-gray-600">{meta.name}</span>
    </div>
  )
}

/**
 * 组件面板
 */
export default function ComponentPanel() {
  const categories = registry.getAllCategories()

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-800">组件库</h2>
        <p className="text-xs text-gray-500 mt-1">拖拽组件到画布</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {categories.map(category => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{category}</h3>
            <div className="grid grid-cols-2 gap-2">
              {registry.getComponentsByCategory(category).map(meta => (
                <DraggableComponent key={meta.type} meta={meta} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}