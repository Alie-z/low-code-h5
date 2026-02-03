import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import type { 
  BuilderState, 
  PageSchema, 
  ComponentInstance, 
  HistoryCommand,
  EventBinding 
} from '@/types'
import registry from '@/core/registry'

interface BuilderActions {
  // 组件操作
  addComponent: (type: string, parentId?: string, index?: number) => string | null
  removeComponent: (id: string) => void
  updateComponent: (id: string, updates: Partial<ComponentInstance>) => void
  moveComponent: (id: string, targetParentId: string | null, index: number) => void
  duplicateComponent: (id: string) => string | null
  
  // 选择操作
  selectComponent: (id: string | null, multi?: boolean) => void
  selectComponents: (ids: string[]) => void
  clearSelection: () => void
  setHoveredComponent: (id: string | null) => void
  
  // 属性操作
  updateComponentProps: (id: string, props: Record<string, unknown>) => void
  updateComponentStyle: (id: string, style: Record<string, unknown>) => void
  updateComponentEvents: (id: string, events: EventBinding[]) => void
  setComponentHidden: (id: string, hidden: boolean) => void
  
  // 历史操作
  undo: () => void
  redo: () => void
  pushHistory: (command: Omit<HistoryCommand, 'timestamp'>) => void
  
  // 页面操作
  setPageTitle: (title: string) => void
  loadPage: (page: PageSchema) => void
  clearPage: () => void
  exportPage: () => PageSchema
  
  // 视图操作
  setPreviewMode: (mode: boolean) => void
  setZoom: (zoom: number) => void
  setDeviceMode: (mode: 'mobile' | 'tablet' | 'desktop') => void
  
  // 剪贴板操作
  copyComponents: () => void
  pasteComponents: (parentId?: string) => void
  
  // 辅助方法
  findComponentById: (id: string) => ComponentInstance | null
  findComponentPath: (id: string) => string[]
}

const createInitialPage = (): PageSchema => ({
  id: nanoid(),
  title: '未命名页面',
  components: [],
  globalStyles: {
    backgroundColor: '#ffffff',
    padding: '16px'
  },
  dataSources: []
})

const initialState: BuilderState = {
  currentPage: createInitialPage(),
  selectedComponentIds: [],
  hoveredComponentId: null,
  previewMode: false,
  history: [],
  historyIndex: -1,
  clipboard: null,
  zoom: 100,
  deviceMode: 'mobile'
}

export const useBuilderStore = create<BuilderState & BuilderActions>()(
  immer((set, get) => ({
    ...initialState,

    // 添加组件
    addComponent: (type, parentId, index) => {
      const meta = registry.getComponent(type)
      if (!meta) {
        console.error(`Component type "${type}" not found in registry`)
        return null
      }

      const newComponent: ComponentInstance = {
        id: nanoid(),
        type,
        props: { ...meta.defaultProps },
        style: {},
        children: meta.allowChildren ? [] : undefined,
        events: []
      }

      set((state) => {
        if (parentId) {
          const parent = findComponentInTree(state.currentPage.components, parentId)
          if (parent && parent.children) {
            const insertIndex = index ?? parent.children.length
            parent.children.splice(insertIndex, 0, newComponent)
          }
        } else {
          const insertIndex = index ?? state.currentPage.components.length
          state.currentPage.components.splice(insertIndex, 0, newComponent)
        }
        state.selectedComponentIds = [newComponent.id]
      })

      return newComponent.id
    },

    // 删除组件
    removeComponent: (id) => {
      set((state) => {
        removeComponentFromTree(state.currentPage.components, id)
        state.selectedComponentIds = state.selectedComponentIds.filter(cid => cid !== id)
        if (state.hoveredComponentId === id) {
          state.hoveredComponentId = null
        }
      })
    },

    // 更新组件
    updateComponent: (id, updates) => {
      set((state) => {
        const component = findComponentInTree(state.currentPage.components, id)
        if (component) {
          Object.assign(component, updates)
        }
      })
    },

    // 移动组件
    moveComponent: (id, targetParentId, index) => {
      set((state) => {
        const component = findComponentInTree(state.currentPage.components, id)
        if (!component) return

        // 复制组件数据
        const componentCopy = JSON.parse(JSON.stringify(component))
        
        // 从原位置删除
        removeComponentFromTree(state.currentPage.components, id)
        
        // 添加到新位置
        if (targetParentId) {
          const parent = findComponentInTree(state.currentPage.components, targetParentId)
          if (parent && parent.children) {
            parent.children.splice(index, 0, componentCopy)
          }
        } else {
          state.currentPage.components.splice(index, 0, componentCopy)
        }
      })
    },

    // 复制组件
    duplicateComponent: (id) => {
      const component = get().findComponentById(id)
      if (!component) return null

      const cloned = cloneComponent(component)
      
      set((state) => {
        // 找到原组件的父级并在其后插入
        const parent = findParentComponent(state.currentPage.components, id)
        if (parent && parent.children) {
          const index = parent.children.findIndex(c => c.id === id)
          parent.children.splice(index + 1, 0, cloned)
        } else {
          const index = state.currentPage.components.findIndex(c => c.id === id)
          state.currentPage.components.splice(index + 1, 0, cloned)
        }
        state.selectedComponentIds = [cloned.id]
      })

      return cloned.id
    },

    // 选择组件
    selectComponent: (id, multi = false) => {
      set((state) => {
        if (id === null) {
          state.selectedComponentIds = []
        } else if (multi) {
          const index = state.selectedComponentIds.indexOf(id)
          if (index === -1) {
            state.selectedComponentIds.push(id)
          } else {
            state.selectedComponentIds.splice(index, 1)
          }
        } else {
          state.selectedComponentIds = [id]
        }
      })
    },

    // 批量选择组件
    selectComponents: (ids) => {
      set((state) => {
        state.selectedComponentIds = ids
      })
    },

    // 清除选择
    clearSelection: () => {
      set((state) => {
        state.selectedComponentIds = []
      })
    },

    // 设置悬停组件
    setHoveredComponent: (id) => {
      set((state) => {
        state.hoveredComponentId = id
      })
    },

    // 更新组件属性
    updateComponentProps: (id, props) => {
      set((state) => {
        const component = findComponentInTree(state.currentPage.components, id)
        if (component) {
          component.props = { ...component.props, ...props }
        }
      })
    },

    // 更新组件样式
    updateComponentStyle: (id, style) => {
      set((state) => {
        const component = findComponentInTree(state.currentPage.components, id)
        if (component) {
          component.style = { ...component.style, ...style }
        }
      })
    },

    // 更新组件事件
    updateComponentEvents: (id, events) => {
      set((state) => {
        const component = findComponentInTree(state.currentPage.components, id)
        if (component) {
          component.events = events
        }
      })
    },

    // 设置组件隐藏状态
    setComponentHidden: (id, hidden) => {
      set((state) => {
        const component = findComponentInTree(state.currentPage.components, id)
        if (component) {
          component.hidden = hidden
        }
      })
    },

    // 撤销
    undo: () => {
      const { history, historyIndex } = get()
      if (historyIndex >= 0) {
        history[historyIndex].undo()
        set((state) => {
          state.historyIndex -= 1
        })
      }
    },

    // 重做
    redo: () => {
      const { history, historyIndex } = get()
      if (historyIndex < history.length - 1) {
        history[historyIndex + 1].redo()
        set((state) => {
          state.historyIndex += 1
        })
      }
    },

    // 推送历史记录
    pushHistory: (command) => {
      set((state) => {
        // 删除当前位置之后的历史
        state.history = state.history.slice(0, state.historyIndex + 1)
        state.history.push({
          ...command,
          timestamp: Date.now()
        })
        state.historyIndex = state.history.length - 1
        
        // 限制历史记录数量
        if (state.history.length > 50) {
          state.history = state.history.slice(-50)
          state.historyIndex = state.history.length - 1
        }
      })
    },

    // 设置页面标题
    setPageTitle: (title) => {
      set((state) => {
        state.currentPage.title = title
      })
    },

    // 加载页面
    loadPage: (page) => {
      set((state) => {
        state.currentPage = page
        state.selectedComponentIds = []
        state.hoveredComponentId = null
        state.history = []
        state.historyIndex = -1
      })
    },

    // 清空页面
    clearPage: () => {
      set((state) => {
        state.currentPage = createInitialPage()
        state.selectedComponentIds = []
        state.hoveredComponentId = null
      })
    },

    // 导出页面
    exportPage: () => {
      return JSON.parse(JSON.stringify(get().currentPage))
    },

    // 设置预览模式
    setPreviewMode: (mode) => {
      set((state) => {
        state.previewMode = mode
        if (mode) {
          state.selectedComponentIds = []
          state.hoveredComponentId = null
        }
      })
    },

    // 设置缩放
    setZoom: (zoom) => {
      set((state) => {
        state.zoom = Math.max(50, Math.min(200, zoom))
      })
    },

    // 设置设备模式
    setDeviceMode: (mode) => {
      set((state) => {
        state.deviceMode = mode
      })
    },

    // 复制组件
    copyComponents: () => {
      const { selectedComponentIds, findComponentById } = get()
      const components = selectedComponentIds
        .map(id => findComponentById(id))
        .filter((c): c is ComponentInstance => c !== null)
      
      if (components.length > 0) {
        set((state) => {
          state.clipboard = components.map(c => cloneComponent(c))
        })
      }
    },

    // 粘贴组件
    pasteComponents: (parentId) => {
      const { clipboard } = get()
      if (!clipboard || clipboard.length === 0) return

      set((state) => {
        const pastedIds: string[] = []
        clipboard.forEach(component => {
          const cloned = cloneComponent(component)
          pastedIds.push(cloned.id)
          
          if (parentId) {
            const parent = findComponentInTree(state.currentPage.components, parentId)
            if (parent && parent.children) {
              parent.children.push(cloned)
            }
          } else {
            state.currentPage.components.push(cloned)
          }
        })
        state.selectedComponentIds = pastedIds
      })
    },

    // 查找组件
    findComponentById: (id) => {
      return findComponentInTree(get().currentPage.components, id)
    },

    // 查找组件路径
    findComponentPath: (id) => {
      const path: string[] = []
      findComponentPathInTree(get().currentPage.components, id, path)
      return path
    }
  }))
)

// 辅助函数：在树中查找组件
function findComponentInTree(
  components: ComponentInstance[], 
  id: string
): ComponentInstance | null {
  for (const component of components) {
    if (component.id === id) return component
    if (component.children) {
      const found = findComponentInTree(component.children, id)
      if (found) return found
    }
  }
  return null
}

// 辅助函数：从树中删除组件
function removeComponentFromTree(
  components: ComponentInstance[], 
  id: string
): boolean {
  const index = components.findIndex(c => c.id === id)
  if (index !== -1) {
    components.splice(index, 1)
    return true
  }
  for (const component of components) {
    if (component.children) {
      if (removeComponentFromTree(component.children, id)) {
        return true
      }
    }
  }
  return false
}

// 辅助函数：查找父组件
function findParentComponent(
  components: ComponentInstance[], 
  id: string
): ComponentInstance | null {
  for (const component of components) {
    if (component.children) {
      if (component.children.some(c => c.id === id)) {
        return component
      }
      const found = findParentComponent(component.children, id)
      if (found) return found
    }
  }
  return null
}

// 辅助函数：克隆组件（生成新ID）
function cloneComponent(component: ComponentInstance): ComponentInstance {
  return {
    ...component,
    id: nanoid(),
    props: { ...component.props },
    style: { ...component.style },
    events: component.events ? [...component.events] : undefined,
    children: component.children 
      ? component.children.map(cloneComponent) 
      : undefined
  }
}

// 辅助函数：查找组件路径
function findComponentPathInTree(
  components: ComponentInstance[], 
  id: string, 
  path: string[]
): boolean {
  for (const component of components) {
    if (component.id === id) {
      path.push(id)
      return true
    }
    if (component.children) {
      path.push(component.id)
      if (findComponentPathInTree(component.children, id, path)) {
        return true
      }
      path.pop()
    }
  }
  return false
}

export default useBuilderStore