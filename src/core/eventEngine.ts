import type { EventBinding, ComponentInstance } from '@/types'

/**
 * 事件动作执行器类型
 */
export type ActionExecutor = (
  binding: EventBinding,
  sourceComponent: ComponentInstance,
  context: EventContext
) => void

/**
 * 事件执行上下文
 */
export interface EventContext {
  // 查找组件
  findComponent: (id: string) => ComponentInstance | null
  // 更新组件属性
  updateComponentProps: (id: string, props: Record<string, unknown>) => void
  // 更新组件可见性
  setComponentHidden: (id: string, hidden: boolean) => void
  // 页面导航
  navigate: (url: string) => void
  // 显示提示
  showMessage: (message: string, type?: 'info' | 'success' | 'error') => void
  // 自定义数据
  customData?: Record<string, unknown>
}

/**
 * 内置动作执行器
 */
const builtinActions: Record<string, ActionExecutor> = {
  /**
   * 设置属性动作
   */
  setProp: (binding, _source, context) => {
    const { targetComponent, payload } = binding
    if (targetComponent && payload && typeof payload === 'object') {
      context.updateComponentProps(targetComponent, payload as Record<string, unknown>)
    }
  },

  /**
   * 显示组件
   */
  show: (binding, _source, context) => {
    const { targetComponent } = binding
    if (targetComponent) {
      context.setComponentHidden(targetComponent, false)
    }
  },

  /**
   * 隐藏组件
   */
  hide: (binding, _source, context) => {
    const { targetComponent } = binding
    if (targetComponent) {
      context.setComponentHidden(targetComponent, true)
    }
  },

  /**
   * 切换显示/隐藏
   */
  toggle: (binding, _source, context) => {
    const { targetComponent } = binding
    if (targetComponent) {
      const target = context.findComponent(targetComponent)
      if (target) {
        context.setComponentHidden(targetComponent, !target.hidden)
      }
    }
  },

  /**
   * 页面导航
   */
  navigate: (binding, _source, context) => {
    const { payload } = binding
    if (payload && typeof payload === 'object' && 'url' in payload) {
      context.navigate(String(payload.url))
    }
  },

  /**
   * 提交表单(显示消息)
   */
  submit: (binding, _source, context) => {
    const { payload } = binding
    const message = payload && typeof payload === 'object' && 'message' in payload 
      ? String(payload.message) 
      : '提交成功！'
    context.showMessage(message, 'success')
  },

  /**
   * 自定义动作(执行JavaScript)
   */
  custom: (binding, source, context) => {
    const { payload } = binding
    if (payload && typeof payload === 'object' && 'code' in payload) {
      try {
        // 创建安全的执行环境
        const fn = new Function('source', 'context', 'binding', String(payload.code))
        fn(source, context, binding)
      } catch (error) {
        console.error('Custom action execution error:', error)
        context.showMessage('自定义动作执行失败', 'error')
      }
    }
  }
}

/**
 * 事件引擎类
 */
class EventEngine {
  private actions = new Map<string, ActionExecutor>()
  private context: EventContext | null = null

  constructor() {
    // 注册内置动作
    Object.entries(builtinActions).forEach(([name, executor]) => {
      this.actions.set(name, executor)
    })
  }

  /**
   * 设置执行上下文
   */
  setContext(context: EventContext): void {
    this.context = context
  }

  /**
   * 注册自定义动作
   */
  registerAction(name: string, executor: ActionExecutor): void {
    this.actions.set(name, executor)
  }

  /**
   * 获取所有可用动作
   */
  getAvailableActions(): { value: string; label: string }[] {
    return [
      { value: 'setProp', label: '设置属性' },
      { value: 'show', label: '显示组件' },
      { value: 'hide', label: '隐藏组件' },
      { value: 'toggle', label: '切换显示' },
      { value: 'navigate', label: '页面跳转' },
      { value: 'submit', label: '提交/消息' },
      { value: 'custom', label: '自定义代码' }
    ]
  }

  /**
   * 执行事件
   */
  executeEvent(
    eventType: string,
    sourceComponent: ComponentInstance
  ): void {
    if (!this.context) {
      console.warn('EventEngine: No context set')
      return
    }

    const bindings = sourceComponent.events?.filter(e => e.eventType === eventType) || []
    
    for (const binding of bindings) {
      const executor = this.actions.get(binding.action)
      if (executor) {
        try {
          executor(binding, sourceComponent, this.context)
        } catch (error) {
          console.error(`EventEngine: Error executing action "${binding.action}"`, error)
        }
      } else {
        console.warn(`EventEngine: Unknown action "${binding.action}"`)
      }
    }
  }

  /**
   * 检查组件是否有指定事件绑定
   */
  hasEventBinding(component: ComponentInstance, eventType: string): boolean {
    return component.events?.some(e => e.eventType === eventType) || false
  }
}

// 单例导出
export const eventEngine = new EventEngine()
export default eventEngine