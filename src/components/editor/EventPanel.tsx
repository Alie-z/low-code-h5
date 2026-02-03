import { useState } from 'react'
import { nanoid } from 'nanoid'
import useBuilderStore from '@/store/builder'
import registry from '@/core/registry'
import eventEngine from '@/core/eventEngine'
import type { ComponentInstance, EventBinding } from '@/types'

interface EventPanelProps {
  component: ComponentInstance
}

/**
 * 单个事件绑定配置
 */
function EventBindingItem({
  binding,
  component,
  onUpdate,
  onRemove
}: {
  binding: EventBinding
  component: ComponentInstance
  onUpdate: (updates: Partial<EventBinding>) => void
  onRemove: () => void
}) {
  const { currentPage } = useBuilderStore()
  const meta = registry.getComponent(component.type)
  const availableActions = eventEngine.getAvailableActions()

  // 获取所有可选的目标组件（排除自己）
  const getAllComponents = (components: ComponentInstance[]): ComponentInstance[] => {
    const result: ComponentInstance[] = []
    for (const c of components) {
      if (c.id !== component.id) {
        result.push(c)
      }
      if (c.children) {
        result.push(...getAllComponents(c.children))
      }
    }
    return result
  }
  
  const targetComponents = getAllComponents(currentPage.components)

  // 获取目标组件的可配置属性
  const getTargetProps = () => {
    if (!binding.targetComponent) return []
    const target = targetComponents.find(c => c.id === binding.targetComponent)
    if (!target) return []
    const targetMeta = registry.getComponent(target.type)
    return targetMeta?.props || []
  }

  const targetProps = getTargetProps()

  // 处理payload更新（针对setProp动作）
  const handlePayloadChange = (propName: string, value: unknown) => {
    const currentPayload = (binding.payload as Record<string, unknown>) || {}
    onUpdate({
      payload: { ...currentPayload, [propName]: value }
    })
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-3">
      {/* 事件类型选择 */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">触发事件</label>
        <select
          value={binding.eventType}
          onChange={(e) => onUpdate({ eventType: e.target.value })}
          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="">请选择</option>
          {meta?.events.map(event => (
            <option key={event.name} value={event.name}>
              {event.label}
            </option>
          ))}
        </select>
      </div>

      {/* 动作类型选择 */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">执行动作</label>
        <select
          value={binding.action}
          onChange={(e) => onUpdate({ 
            action: e.target.value as EventBinding['action'],
            payload: undefined  // 切换动作时清空payload
          })}
          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          {availableActions.map(action => (
            <option key={action.value} value={action.value}>
              {action.label}
            </option>
          ))}
        </select>
      </div>

      {/* 目标组件选择（显示/隐藏/切换/设置属性需要） */}
      {['show', 'hide', 'toggle', 'setProp'].includes(binding.action) && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">目标组件</label>
          <select
            value={binding.targetComponent}
            onChange={(e) => onUpdate({ targetComponent: e.target.value, payload: undefined })}
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">请选择</option>
            {targetComponents.map(c => {
              const cMeta = registry.getComponent(c.type)
              return (
                <option key={c.id} value={c.id}>
                  {cMeta?.name || c.type} ({c.id.slice(0, 6)})
                </option>
              )
            })}
          </select>
        </div>
      )}

      {/* 设置属性的具体配置 */}
      {binding.action === 'setProp' && binding.targetComponent && targetProps.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <label className="block text-xs text-gray-500">设置属性值</label>
          {targetProps.slice(0, 5).map(prop => (
            <div key={prop.name} className="flex items-center gap-2">
              <span className="text-xs text-gray-600 w-20 flex-shrink-0">{prop.label}</span>
              {prop.type === 'boolean' ? (
                <select
                  value={String((binding.payload as Record<string, unknown>)?.[prop.name] ?? '')}
                  onChange={(e) => handlePayloadChange(prop.name, e.target.value === 'true')}
                  className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded bg-white"
                >
                  <option value="">不修改</option>
                  <option value="true">是</option>
                  <option value="false">否</option>
                </select>
              ) : prop.type === 'select' ? (
                <select
                  value={String((binding.payload as Record<string, unknown>)?.[prop.name] ?? '')}
                  onChange={(e) => handlePayloadChange(prop.name, e.target.value || undefined)}
                  className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded bg-white"
                >
                  <option value="">不修改</option>
                  {prop.options?.map(opt => (
                    <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={prop.type === 'number' ? 'number' : 'text'}
                  placeholder="不修改"
                  value={String((binding.payload as Record<string, unknown>)?.[prop.name] ?? '')}
                  onChange={(e) => handlePayloadChange(
                    prop.name, 
                    prop.type === 'number' ? Number(e.target.value) : e.target.value || undefined
                  )}
                  className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* 页面跳转URL */}
      {binding.action === 'navigate' && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">跳转地址</label>
          <input
            type="text"
            placeholder="https://example.com"
            value={((binding.payload as Record<string, unknown>)?.url as string) || ''}
            onChange={(e) => onUpdate({ payload: { url: e.target.value } })}
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      )}

      {/* 提交消息 */}
      {binding.action === 'submit' && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">提示消息</label>
          <input
            type="text"
            placeholder="提交成功！"
            value={((binding.payload as Record<string, unknown>)?.message as string) || ''}
            onChange={(e) => onUpdate({ payload: { message: e.target.value } })}
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      )}

      {/* 自定义代码 */}
      {binding.action === 'custom' && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">JavaScript代码</label>
          <textarea
            placeholder="context.showMessage('Hello!')"
            value={((binding.payload as Record<string, unknown>)?.code as string) || ''}
            onChange={(e) => onUpdate({ payload: { code: e.target.value } })}
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono h-20 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            可用变量：source(源组件), context, binding
          </p>
        </div>
      )}

      {/* 删除按钮 */}
      <button
        onClick={onRemove}
        className="w-full py-1.5 text-xs text-red-500 hover:bg-red-50 rounded transition-colors"
      >
        删除此事件
      </button>
    </div>
  )
}

/**
 * 事件配置面板
 */
export default function EventPanel({ component }: EventPanelProps) {
  const { updateComponentEvents } = useBuilderStore()
  const [expanded, setExpanded] = useState(true)
  
  const events = component.events || []

  // 添加事件绑定
  const handleAddEvent = () => {
    const newBinding: EventBinding = {
      id: nanoid(),
      eventType: '',
      targetComponent: '',
      action: 'show'
    }
    updateComponentEvents(component.id, [...events, newBinding])
  }

  // 更新事件绑定
  const handleUpdateEvent = (bindingId: string, updates: Partial<EventBinding>) => {
    const newEvents = events.map(e => 
      e.id === bindingId ? { ...e, ...updates } : e
    )
    updateComponentEvents(component.id, newEvents)
  }

  // 删除事件绑定
  const handleRemoveEvent = (bindingId: string) => {
    const newEvents = events.filter(e => e.id !== bindingId)
    updateComponentEvents(component.id, newEvents)
  }

  const meta = registry.getComponent(component.type)
  const hasEvents = meta?.events && meta.events.length > 0

  if (!hasEvents) {
    return (
      <div className="text-center text-gray-400 py-4 text-sm">
        该组件不支持事件
      </div>
    )
  }

  return (
    <div>
      <div 
        className="flex items-center justify-between cursor-pointer py-2"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-sm font-medium text-gray-700">
          事件联动 
          {events.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary-100 text-primary-600 rounded">
              {events.length}
            </span>
          )}
        </h3>
        <span className="text-gray-400 text-sm">
          {expanded ? '▼' : '▶'}
        </span>
      </div>

      {expanded && (
        <div className="space-y-3">
          {/* 已配置的事件列表 */}
          {events.map(binding => (
            <EventBindingItem
              key={binding.id}
              binding={binding}
              component={component}
              onUpdate={(updates) => handleUpdateEvent(binding.id, updates)}
              onRemove={() => handleRemoveEvent(binding.id)}
            />
          ))}

          {/* 添加事件按钮 */}
          <button
            onClick={handleAddEvent}
            className="w-full py-2 text-sm text-primary-500 border border-dashed border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
          >
            + 添加事件
          </button>

          {/* 可用事件提示 */}
          <div className="text-xs text-gray-400 space-y-1">
            <p>支持的事件：</p>
            <ul className="list-disc list-inside">
              {meta.events.map(event => (
                <li key={event.name}>{event.label}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}