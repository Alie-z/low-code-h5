import type { ComponentMeta } from '@/types'

/**
 * 组件注册中心
 * 负责管理所有可用组件的元数据
 */
class ComponentRegistry {
  private static instance: ComponentRegistry
  private components = new Map<string, ComponentMeta>()
  private categories = new Set<string>()

  private constructor() {}

  static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry()
    }
    return ComponentRegistry.instance
  }

  /**
   * 注册组件
   */
  register(meta: ComponentMeta): void {
    if (this.components.has(meta.type)) {
      console.warn(`Component type "${meta.type}" is already registered. Overwriting...`)
    }
    this.components.set(meta.type, meta)
    this.categories.add(meta.category)
  }

  /**
   * 批量注册组件
   */
  registerAll(metas: ComponentMeta[]): void {
    metas.forEach(meta => this.register(meta))
  }

  /**
   * 获取组件元数据
   */
  getComponent(type: string): ComponentMeta | undefined {
    return this.components.get(type)
  }

  /**
   * 获取所有组件
   */
  getAllComponents(): ComponentMeta[] {
    return Array.from(this.components.values())
  }

  /**
   * 获取所有分类
   */
  getAllCategories(): string[] {
    return Array.from(this.categories)
  }

  /**
   * 按分类获取组件
   */
  getComponentsByCategory(category: string): ComponentMeta[] {
    return this.getAllComponents().filter(c => c.category === category)
  }

  /**
   * 检查组件是否存在
   */
  hasComponent(type: string): boolean {
    return this.components.has(type)
  }

  /**
   * 注销组件
   */
  unregister(type: string): boolean {
    return this.components.delete(type)
  }

  /**
   * 清空所有注册
   */
  clear(): void {
    this.components.clear()
    this.categories.clear()
  }
}

export const registry = ComponentRegistry.getInstance()
export default registry