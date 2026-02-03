import { useMemo } from 'react'
import useBuilderStore from '@/store/builder'
import registry from '@/core/registry'
import type { PropSchema, ComponentInstance } from '@/types'
import EventPanel from './EventPanel'

/**
 * 属性输入组件
 */
function PropInput({ 
  schema, 
  value, 
  onChange 
}: { 
  schema: PropSchema
  value: unknown
  onChange: (value: unknown) => void 
}) {
  switch (schema.type) {
    case 'string':
    case 'image':
      return (
        <input
          type="text"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={schema.placeholder}
          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      )

    case 'number':
      return (
        <input
          type="number"
          value={Number(value ?? 0)}
          onChange={(e) => onChange(Number(e.target.value))}
          min={schema.min}
          max={schema.max}
          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      )

    case 'boolean':
      return (
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-600">启用</span>
        </label>
      )

    case 'select':
      return (
        <select
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
        >
          {schema.options?.map(opt => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )

    case 'color':
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={String(value ?? '#000000')}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 p-1 border border-gray-200 rounded cursor-pointer"
          />
          <input
            type="text"
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      )

    default:
      return (
        <input
          type="text"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      )
  }
}

/**
 * 样式输入组件
 */
function StyleInput({
  label,
  value,
  onChange,
  type = 'text'
}: {
  label: string
  value: string | number | undefined
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="w-20 text-xs text-gray-500 flex-shrink-0">{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
    </div>
  )
}

/**
 * 组件属性配置面板
 */
function ComponentConfig({ component }: { component: ComponentInstance }) {
  const { updateComponentProps, updateComponentStyle, removeComponent, duplicateComponent } = useBuilderStore()
  const meta = registry.getComponent(component.type)

  if (!meta) {
    return <div className="p-4 text-gray-500">未找到组件配置</div>
  }

  return (
    <div className="space-y-6">
      {/* 组件操作按钮 */}
      <div className="flex gap-2">
        <button
          onClick={() => duplicateComponent(component.id)}
          className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          复制
        </button>
        <button
          onClick={() => removeComponent(component.id)}
          className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
        >
          删除
        </button>
      </div>

      {/* 基础属性 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">基础属性</h3>
        <div className="space-y-4">
          {meta.props.map(prop => (
            <div key={prop.name}>
              <label className="block text-xs text-gray-500 mb-1">
                {prop.label}
                {prop.required && <span className="text-red-500">*</span>}
              </label>
              <PropInput
                schema={prop}
                value={component.props[prop.name]}
                onChange={(value) => updateComponentProps(component.id, { [prop.name]: value })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 样式属性 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">样式设置</h3>
        <div className="space-y-3">
          <StyleInput
            label="宽度"
            value={component.style.width as string}
            onChange={(v) => updateComponentStyle(component.id, { width: v })}
          />
          <StyleInput
            label="高度"
            value={component.style.height as string}
            onChange={(v) => updateComponentStyle(component.id, { height: v })}
          />
          <StyleInput
            label="外边距"
            value={component.style.margin as string}
            onChange={(v) => updateComponentStyle(component.id, { margin: v })}
          />
          <StyleInput
            label="内边距"
            value={component.style.padding as string}
            onChange={(v) => updateComponentStyle(component.id, { padding: v })}
          />
          <div className="flex items-center gap-2">
            <label className="w-20 text-xs text-gray-500 flex-shrink-0">背景色</label>
            <input
              type="color"
              value={String(component.style.backgroundColor ?? '#ffffff')}
              onChange={(e) => updateComponentStyle(component.id, { backgroundColor: e.target.value })}
              className="w-8 h-8 p-0.5 border border-gray-200 rounded cursor-pointer"
            />
            <input
              type="text"
              value={String(component.style.backgroundColor ?? '')}
              onChange={(e) => updateComponentStyle(component.id, { backgroundColor: e.target.value })}
              className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm"
            />
          </div>
          <StyleInput
            label="圆角"
            value={component.style.borderRadius as string}
            onChange={(v) => updateComponentStyle(component.id, { borderRadius: v })}
          />
        </div>
      </div>

      {/* 事件联动配置 */}
      <div className="pt-4 border-t border-gray-200">
        <EventPanel component={component} />
      </div>
    </div>
  )
}

/**
 * 属性面板
 */
export default function PropertyPanel() {
  const { selectedComponentIds, findComponentById, currentPage } = useBuilderStore()

  const selectedComponent = useMemo(() => {
    if (selectedComponentIds.length === 1) {
      return findComponentById(selectedComponentIds[0])
    }
    return null
  }, [selectedComponentIds, findComponentById, currentPage])

  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-800">属性配置</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedComponentIds.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <span className="text-3xl block mb-2">👆</span>
            <span className="text-sm">选择组件以编辑属性</span>
          </div>
        )}

        {selectedComponentIds.length === 1 && selectedComponent && (
          <ComponentConfig component={selectedComponent} />
        )}

        {selectedComponentIds.length > 1 && (
          <div className="text-center text-gray-400 py-8">
            <span className="text-sm">已选择 {selectedComponentIds.length} 个组件</span>
          </div>
        )}
      </div>
    </div>
  )
}
