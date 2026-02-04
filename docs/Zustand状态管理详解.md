# Zustand 状态管理详解

> 本文档详细介绍 Zustand 的核心概念、使用方法，以及与 Redux、MobX 的对比分析。

## 一、Zustand 简介

### 1.1 什么是 Zustand

**Zustand**（德语中意为"状态"）是一个小巧、快速、可扩展的 React 状态管理库，由 Poimandres（React Three Fiber 团队）开发维护。

核心特点：
- 📦 **极致轻量** - 仅 ~1KB（gzip），无外部依赖
- 🎯 **简洁 API** - 没有样板代码，没有 Provider 包裹
- ⚡ **高性能** - 基于 selector 的精准渲染优化
- 🔧 **灵活扩展** - 丰富的中间件生态

### 1.2 安装

```bash
# npm
npm install zustand

# yarn
yarn add zustand

# pnpm
pnpm add zustand
```

---

## 二、核心概念与基础用法

### 2.1 创建 Store

Zustand 使用 `create` 函数创建 store，返回一个 React Hook：

```typescript
import { create } from 'zustand'

// 定义状态类型
interface CounterState {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

// 创建 store
const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}))
```

### 2.2 在组件中使用

```tsx
function Counter() {
  // 方式1：获取整个状态（不推荐，会导致不必要的重渲染）
  const { count, increment, decrement } = useCounterStore()
  
  // 方式2：使用 selector 精确订阅（推荐）
  const count = useCounterStore((state) => state.count)
  const increment = useCounterStore((state) => state.increment)
  
  return (
    <div>
      <span>{count}</span>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  )
}
```

### 2.3 set 和 get 函数

```typescript
const useStore = create((set, get) => ({
  count: 0,
  
  // set: 更新状态
  increment: () => set((state) => ({ count: state.count + 1 })),
  
  // set 的第二个参数 replace（默认 false 会合并状态，true 会替换整个状态）
  resetAll: () => set({ count: 0 }, true),
  
  // get: 获取当前状态（用于 action 中读取最新状态）
  doubleCount: () => {
    const current = get().count
    set({ count: current * 2 })
  },
}))
```

### 2.4 异步 Actions

Zustand 天然支持异步操作，无需额外配置：

```typescript
const useUserStore = create((set) => ({
  user: null,
  loading: false,
  error: null,
  
  fetchUser: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/users/${id}`)
      const user = await response.json()
      set({ user, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
}))
```

---

## 三、进阶用法

### 3.1 在 React 外部访问 Store

```typescript
// 获取当前状态
const state = useStore.getState()

// 订阅状态变化
const unsubscribe = useStore.subscribe(
  (state) => console.log('State changed:', state)
)

// 在组件外部更新状态
useStore.setState({ count: 10 })

// 销毁 store
useStore.destroy()
```

### 3.2 Selector 优化

```typescript
// ❌ 不推荐：每次都创建新的对象引用
const { count, user } = useStore((state) => ({ 
  count: state.count, 
  user: state.user 
}))

// ✅ 推荐方式1：分开订阅
const count = useStore((state) => state.count)
const user = useStore((state) => state.user)

// ✅ 推荐方式2：使用 useShallow 浅比较
import { useShallow } from 'zustand/react/shallow'

const { count, user } = useStore(
  useShallow((state) => ({ count: state.count, user: state.user }))
)
```

### 3.3 Store 切片（Slices Pattern）

大型应用可以将 store 拆分为多个切片：

```typescript
// slices/userSlice.ts
export const createUserSlice = (set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
})

// slices/cartSlice.ts
export const createCartSlice = (set, get) => ({
  items: [],
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
})

// store.ts - 合并切片
const useStore = create((...args) => ({
  ...createUserSlice(...args),
  ...createCartSlice(...args),
}))
```

---

## 四、中间件生态

### 4.1 Immer 中间件（不可变数据更新）

```typescript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

const useStore = create(
  immer((set) => ({
    todos: [],
    addTodo: (text) =>
      set((state) => {
        // 可以直接修改 state，Immer 会处理不可变性
        state.todos.push({ id: Date.now(), text, done: false })
      }),
    toggleTodo: (id) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === id)
        if (todo) todo.done = !todo.done
      }),
  }))
)
```

### 4.2 Persist 中间件（状态持久化）

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useStore = create(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'app-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }), // 只持久化部分状态
    }
  )
)
```

### 4.3 Devtools 中间件（Redux DevTools 集成）

```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const useStore = create(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set(
        (state) => ({ count: state.count + 1 }),
        false, // replace
        'increment' // action name（显示在 DevTools 中）
      ),
    }),
    { name: 'MyStore' }
  )
)
```

### 4.4 中间件组合

```typescript
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

const useStore = create(
  devtools(
    persist(
      immer((set) => ({
        // ... store 定义
      })),
      { name: 'storage-key' }
    ),
    { name: 'DevTools-Name' }
  )
)
```

---

## 五、项目实战示例

以下是本项目（低代码 H5 编辑器）中的 Zustand 使用示例：

```typescript
// store/builder.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export const useBuilderStore = create<BuilderState & BuilderActions>()(
  immer((set, get) => ({
    // 状态
    currentPage: createInitialPage(),
    selectedComponentIds: [],
    hoveredComponentId: null,
    previewMode: false,
    history: [],
    historyIndex: -1,
    clipboard: null,
    zoom: 100,
    deviceMode: 'mobile',

    // 添加组件 - 利用 Immer 直接修改嵌套状态
    addComponent: (type, parentId, index) => {
      const meta = registry.getComponent(type)
      if (!meta) return null

      const newComponent = {
        id: nanoid(),
        type,
        props: { ...meta.defaultProps },
        // ...
      }

      set((state) => {
        if (parentId) {
          const parent = findComponentInTree(state.currentPage.components, parentId)
          if (parent?.children) {
            parent.children.splice(index ?? parent.children.length, 0, newComponent)
          }
        } else {
          state.currentPage.components.splice(
            index ?? state.currentPage.components.length, 
            0, 
            newComponent
          )
        }
        state.selectedComponentIds = [newComponent.id]
      })

      return newComponent.id
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

    // 使用 get() 在 action 中获取最新状态
    findComponentById: (id) => {
      return findComponentInTree(get().currentPage.components, id)
    },
  }))
)
```

---

## 六、与 Redux、MobX 对比

### 6.1 核心对比表

| 特性 | Zustand | Redux | MobX |
|------|---------|-------|------|
| **包体积** | ~1KB | ~7KB (+ toolkit ~11KB) | ~16KB |
| **样板代码** | 极少 | 较多（需要 actions, reducers, selectors） | 较少 |
| **学习曲线** | 低 | 中高 | 中 |
| **Provider 要求** | ❌ 不需要 | ✅ 必需 | ✅ 必需 |
| **TypeScript 支持** | 原生支持 | 需要额外配置 | 需要装饰器支持 |
| **异步处理** | 内置支持 | 需要 thunk/saga | 内置支持 |
| **DevTools** | 通过中间件支持 | 原生支持 | 通过扩展支持 |
| **状态可变性** | 不可变（可配合 Immer） | 强制不可变 | 可变（响应式） |
| **渲染优化** | 基于 selector | 需要手动 memo/selector | 自动追踪 |

### 6.2 代码对比

#### 计数器示例

**Redux Toolkit**

```typescript
// counterSlice.ts
import { createSlice } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1 },
    decrement: (state) => { state.value -= 1 },
  },
})

export const { increment, decrement } = counterSlice.actions
export default counterSlice.reducer

// store.ts
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './counterSlice'

export const store = configureStore({
  reducer: { counter: counterReducer },
})

// App.tsx - 需要 Provider
import { Provider } from 'react-redux'
import { store } from './store'

function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  )
}

// Counter.tsx
import { useSelector, useDispatch } from 'react-redux'
import { increment, decrement } from './counterSlice'

function Counter() {
  const count = useSelector((state) => state.counter.value)
  const dispatch = useDispatch()
  
  return (
    <div>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
    </div>
  )
}
```

**MobX**

```typescript
// counterStore.ts
import { makeAutoObservable } from 'mobx'

class CounterStore {
  value = 0

  constructor() {
    makeAutoObservable(this)
  }

  increment() {
    this.value += 1
  }

  decrement() {
    this.value -= 1
  }
}

export const counterStore = new CounterStore()

// App.tsx - 需要 Provider（或直接导入）
import { createContext, useContext } from 'react'
import { counterStore } from './counterStore'

const StoreContext = createContext(counterStore)

function App() {
  return (
    <StoreContext.Provider value={counterStore}>
      <Counter />
    </StoreContext.Provider>
  )
}

// Counter.tsx
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'

const Counter = observer(() => {
  const store = useContext(StoreContext)
  
  return (
    <div>
      <span>{store.value}</span>
      <button onClick={() => store.increment()}>+</button>
      <button onClick={() => store.decrement()}>-</button>
    </div>
  )
})
```

**Zustand** ✨

```typescript
// counterStore.ts
import { create } from 'zustand'

const useCounterStore = create((set) => ({
  value: 0,
  increment: () => set((state) => ({ value: state.value + 1 })),
  decrement: () => set((state) => ({ value: state.value - 1 })),
}))

// Counter.tsx - 无需 Provider！
function Counter() {
  const value = useCounterStore((state) => state.value)
  const increment = useCounterStore((state) => state.increment)
  const decrement = useCounterStore((state) => state.decrement)
  
  return (
    <div>
      <span>{value}</span>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  )
}
```

### 6.3 Zustand 相比 Redux 的优势

| 优势 | 说明 |
|------|------|
| **零样板代码** | 无需定义 action types、action creators、reducers，代码量减少 60-70% |
| **无 Provider 地狱** | 不需要在根组件包裹 Provider，可以直接在任何地方使用 |
| **更好的代码组织** | 状态和操作可以放在一起，更符合模块化思维 |
| **更简单的异步** | 无需 redux-thunk、redux-saga 等额外库 |
| **更小的包体积** | Zustand ~1KB vs Redux Toolkit ~18KB |
| **原生 TypeScript** | 类型推断更自然，无需复杂的泛型配置 |
| **更灵活的 selector** | 内置的 selector 机制，自动进行渲染优化 |

### 6.4 Zustand 相比 MobX 的优势

| 优势 | 说明 |
|------|------|
| **更轻量** | ~1KB vs ~16KB |
| **无魔法** | 没有装饰器、Proxy 等"黑盒"机制，行为可预测 |
| **更好的 React 集成** | 基于 hooks 设计，与现代 React 模式一致 |
| **无需 observer 包裹** | 组件不需要用 HOC 包裹 |
| **更简单的心智模型** | 不可变数据更新（配合 Immer），与 React 思维一致 |
| **更容易调试** | 支持 Redux DevTools，状态变化清晰可追溯 |
| **SSR 友好** | 服务端渲染场景更简单 |

---

## 七、为什么越来越多项目选择 Zustand

### 7.1 开发体验革命

```
Redux 时代的痛点：
├── 文件散落（actions/reducers/selectors/types）
├── 大量样板代码
├── 异步处理复杂
├── TypeScript 配置繁琐
└── 学习曲线陡峭

Zustand 的解决方案：
├── 单文件定义状态和操作
├── 几乎零样板代码
├── 原生支持异步
├── 开箱即用的 TypeScript
└── 10分钟上手
```

### 7.2 性能与体积

- **首屏加载**：Zustand 仅 1KB，对于移动端 H5 尤其重要
- **运行时性能**：基于 selector 的精准更新，避免不必要渲染
- **内存占用**：更少的中间层和抽象

### 7.3 现代 React 的最佳搭档

- 完全拥抱 Hooks API
- 与 React 18 Concurrent Mode 兼容
- 支持 React Server Components

### 7.4 生态成熟

- **官方中间件**：persist、devtools、immer、subscribeWithSelector
- **社区插件**：zustand-lens、zustand-querystring、zustand-computed 等
- **良好维护**：由 Poimandres 团队持续维护，React Three Fiber 的同一团队

### 7.5 大厂和知名项目采用

- **Vercel** - Next.js 团队在示例中推荐
- **Jotai/Valtio** - 同一团队的姊妹项目，生态互通
- **开源项目**：Excalidraw、Cal.com、Remotion 等

### 7.6 适用场景

Zustand 特别适合：

✅ 中小型应用的全局状态管理  
✅ 微前端场景（无 Provider 依赖）  
✅ 需要跨组件共享状态的场景  
✅ 追求极致性能和包体积的项目  
✅ TypeScript 项目  
✅ React Native 应用  

---

## 八、最佳实践

### 8.1 文件组织建议

```
src/
├── store/
│   ├── index.ts          # 统一导出
│   ├── useUserStore.ts   # 用户相关状态
│   ├── useCartStore.ts   # 购物车状态
│   └── useUIStore.ts     # UI 状态
```

### 8.2 命名规范

- Store Hook 以 `use` 开头：`useUserStore`、`useCartStore`
- Actions 使用动词：`setUser`、`fetchData`、`toggleModal`

### 8.3 性能优化清单

- [ ] 使用 selector 精确订阅所需状态
- [ ] 避免在 selector 中返回新对象
- [ ] 使用 `useShallow` 订阅多个原始值
- [ ] 大型嵌套状态考虑使用 Immer 中间件
- [ ] 频繁更新的状态考虑拆分为独立 store

### 8.4 TypeScript 最佳实践

```typescript
// 明确定义状态和操作的类型
interface State {
  count: number
}

interface Actions {
  increment: () => void
  setCount: (count: number) => void
}

// 组合类型
type Store = State & Actions

// 创建 store
const useStore = create<Store>()((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
  setCount: (count) => set({ count }),
}))
```

---

## 九、迁移指南

### 从 Redux 迁移

1. 将 reducer 逻辑转换为 Zustand actions
2. 移除 Provider 包裹
3. 将 `useSelector` + `useDispatch` 替换为直接使用 store hook
4. 逐步迁移，可以两者共存

### 从 MobX 迁移

1. 将 class store 转换为 Zustand 函数式 store
2. 移除 `observer` HOC 包裹
3. 将可变更新改为不可变更新（或使用 Immer）

---

## 十、总结

Zustand 代表了 React 状态管理的新趋势：**更少的样板、更好的开发体验、更小的包体积**。

它不是要完全取代 Redux（Redux 在大型团队协作、复杂业务流程方面仍有优势），而是为大多数日常项目提供了一个更轻量、更实用的选择。

> "The best code is no code at all." — Zustand 的设计理念正是如此。

---

## 十一、Zustand 原理深度解析

### 11.1 核心架构：发布-订阅模式

Zustand 的核心是一个**精简的发布-订阅（Pub-Sub）系统**：

```
┌─────────────────────────────────────────────────────────┐
│                      Zustand Store                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │    State    │    │  Listeners  │    │   Actions   │  │
│  │  (状态对象)  │    │ (订阅者集合) │    │  (修改方法)  │  │
│  └─────────────┘    └─────────────┘    └─────────────┘  │
│         │                  ▲                  │         │
│         │                  │                  │         │
│         ▼                  │                  ▼         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              set() / setState()                  │   │
│  │         更新 state → 通知所有 listeners          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │Component │    │Component │    │Component │
        │    A     │    │    B     │    │    C     │
        └──────────┘    └──────────┘    └──────────┘
```

### 11.2 源码级实现：create 函数

Zustand 的核心代码极其精简（约 50 行），下面是简化后的核心实现：

```typescript
// vanilla.ts - 与框架无关的核心逻辑
function createStore(createState) {
  let state;                          // 当前状态
  const listeners = new Set();        // 订阅者集合

  // 获取当前状态
  const getState = () => state;

  // 更新状态
  const setState = (partial, replace) => {
    // 支持函数式更新或直接传入新值
    const nextState = typeof partial === 'function' 
      ? partial(state) 
      : partial;
    
    // 只有状态真正变化才触发更新
    if (!Object.is(nextState, state)) {
      const previousState = state;
      
      // 合并或替换状态
      state = replace 
        ? nextState 
        : Object.assign({}, state, nextState);
      
      // 通知所有订阅者
      listeners.forEach((listener) => listener(state, previousState));
    }
  };

  // 订阅状态变化
  const subscribe = (listener) => {
    listeners.add(listener);
    // 返回取消订阅函数
    return () => listeners.delete(listener);
  };

  // 销毁 store
  const destroy = () => {
    listeners.clear();
  };

  // 初始化状态（执行用户传入的 createState 函数）
  state = createState(setState, getState, { setState, getState, subscribe, destroy });

  return { getState, setState, subscribe, destroy };
}
```

### 11.3 React 集成：useSyncExternalStore

Zustand 通过 React 18 的 `useSyncExternalStore` 实现与 React 的集成：

```typescript
// react.ts - React 绑定
import { useSyncExternalStore } from 'react';

function useStore(api, selector = (state) => state, equalityFn = Object.is) {
  // useSyncExternalStore 参数：
  // 1. subscribe: 订阅函数
  // 2. getSnapshot: 获取当前状态快照
  const slice = useSyncExternalStore(
    api.subscribe,
    () => selector(api.getState()),      // 客户端快照
    () => selector(api.getInitialState()) // 服务端快照（SSR）
  );
  
  return slice;
}

// create 函数：组合 vanilla store + React hook
function create(createState) {
  // 创建 vanilla store
  const api = createStore(createState);
  
  // 返回 React hook
  const useBoundStore = (selector, equalityFn) => 
    useStore(api, selector, equalityFn);
  
  // 将 store 方法附加到 hook 上
  Object.assign(useBoundStore, api);
  
  return useBoundStore;
}
```

**为什么使用 `useSyncExternalStore`？**

1. **并发安全**：解决 React 18 并发模式下的"撕裂"（tearing）问题
2. **自动订阅管理**：React 自动处理订阅和取消订阅
3. **SSR 支持**：内置服务端渲染快照支持

### 11.4 Selector 优化原理

Zustand 的渲染优化核心在于 **selector + 浅比较**：

```typescript
// 工作流程
function useStore(api, selector, equalityFn = Object.is) {
  // 1. 订阅 store 变化
  // 2. 状态变化时，计算新的 selector 结果
  // 3. 使用 equalityFn 比较新旧结果
  // 4. 只有结果不同才触发组件重渲染

  const currentSlice = selector(api.getState());
  
  // React 内部会缓存上一次的 slice
  // 并在 subscribe 回调中比较：
  // if (!equalityFn(previousSlice, currentSlice)) {
  //   forceUpdate(); // 触发重渲染
  // }
}
```

**渲染优化示例：**

```typescript
const useStore = create((set) => ({
  user: { name: 'Alice', age: 25 },
  theme: 'dark',
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));

// 组件 A：只订阅 count
function CounterDisplay() {
  const count = useStore((s) => s.count);  // ← selector
  // 当 theme 或 user 变化时，此组件不会重渲染！
  return <div>{count}</div>;
}

// 组件 B：订阅 theme
function ThemeDisplay() {
  const theme = useStore((s) => s.theme);
  // 当 count 或 user 变化时，此组件不会重渲染！
  return <div>{theme}</div>;
}
```

### 11.5 中间件机制原理

Zustand 中间件基于 **高阶函数** 实现：

```typescript
// 中间件签名
type Middleware = (config) => (set, get, api) => initialState

// 中间件实现示例：logger
const logger = (config) => (set, get, api) => {
  return config(
    (...args) => {
      console.log('  prev state:', get());
      set(...args);  // 调用原始 set
      console.log('  next state:', get());
    },
    get,
    api
  );
};

// 使用中间件
const useStore = create(
  logger((set) => ({
    count: 0,
    increment: () => set((s) => ({ count: s.count + 1 })),
  }))
);
```

**中间件洋葱模型：**

```
请求流程（set 调用）:
┌─────────────────────────────────────────┐
│  devtools                               │
│  ┌───────────────────────────────────┐  │
│  │  persist                          │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  immer                      │  │  │
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │  原始 set 函数        │  │  │  │
│  │  │  │  (更新 state)         │  │  │  │
│  │  │  └───────────────────────┘  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 11.6 Immer 中间件实现原理

```typescript
import { produce } from 'immer';

const immer = (config) => (set, get, api) => {
  return config(
    (updater, replace) => {
      // 如果 updater 是函数，用 Immer 的 produce 包装
      if (typeof updater === 'function') {
        return set(produce(updater), replace);
      }
      // 否则直接传递
      return set(updater, replace);
    },
    get,
    api
  );
};

// 使用效果
const useStore = create(
  immer((set) => ({
    nested: { deep: { value: 0 } },
    updateDeep: () => set((state) => {
      // 可以直接修改，Immer 处理不可变性
      state.nested.deep.value += 1;
    }),
  }))
);
```

### 11.7 Persist 中间件实现原理

```typescript
const persist = (config, options) => (set, get, api) => {
  const { name, storage = localStorage } = options;

  // 初始化时从 storage 恢复状态
  const savedState = storage.getItem(name);
  const initialState = config(
    (...args) => {
      set(...args);
      // 每次 set 后同步到 storage
      storage.setItem(name, JSON.stringify(get()));
    },
    get,
    api
  );

  // 合并已保存的状态
  if (savedState) {
    return { ...initialState, ...JSON.parse(savedState) };
  }
  
  return initialState;
};
```

### 11.8 与 Redux 原理对比

| 方面 | Zustand | Redux |
|------|---------|-------|
| **状态更新** | 直接调用 `set()` | dispatch action → reducer 计算新状态 |
| **订阅机制** | 直接订阅 store | 通过 react-redux 的 Provider 注入 |
| **更新通知** | 直接通知 listeners | 通过 context 传播 |
| **selector** | 在 hook 中执行 | 需要 reselect 或手动 memo |
| **中间件** | 高阶函数包装 | enhancer + applyMiddleware |
| **不可变性** | 可选（配合 Immer） | 强制要求 |

### 11.9 性能关键点

```typescript
// ❌ 性能陷阱：每次返回新对象
const data = useStore((s) => ({ a: s.a, b: s.b }));
// 即使 a, b 没变，每次都创建新对象 → 每次都重渲染

// ✅ 方案1：分开订阅
const a = useStore((s) => s.a);
const b = useStore((s) => s.b);

// ✅ 方案2：使用 useShallow
import { useShallow } from 'zustand/react/shallow';
const data = useStore(useShallow((s) => ({ a: s.a, b: s.b })));
// useShallow 内部实现：浅比较对象的每个属性

// useShallow 简化实现
function useShallow(selector) {
  return (state) => selector(state);
  // 配合自定义 equalityFn：
  // (a, b) => Object.keys(a).every(key => Object.is(a[key], b[key]))
}
```

### 11.10 完整的状态更新流程

```
用户交互 → 调用 action
     │
     ▼
action 内部调用 set(updater)
     │
     ▼
┌────────────────────────────────┐
│ 中间件链（由外向内）            │
│  devtools → persist → immer   │
└────────────────────────────────┘
     │
     ▼
计算新状态: nextState = updater(currentState)
     │
     ▼
Object.is(nextState, currentState) 比较
     │
     ├─ 相等 → 终止，不通知
     │
     └─ 不相等 → 更新 state，通知 listeners
                    │
                    ▼
          ┌─────────────────────┐
          │ 所有订阅的组件       │
          │ 执行 selector       │
          │ 比较 selector 结果  │
          └─────────────────────┘
                    │
     ┌──────────────┴──────────────┐
     ▼                             ▼
结果相同 → 不重渲染          结果不同 → 触发重渲染
```

### 11.11 为什么 Zustand 这么快？

1. **无 Context 开销**：不依赖 React Context，避免 Provider 带来的全局更新
2. **精准订阅**：通过 selector 实现组件级别的订阅粒度
3. **原生 JS**：状态存储在闭包中，访问速度极快
4. **惰性订阅**：只有组件挂载时才添加订阅
5. **同步更新**：`useSyncExternalStore` 确保状态和 UI 同步

### 11.12 手写一个迷你 Zustand

```typescript
// 50行实现核心功能
import { useSyncExternalStore } from 'react';

function create(createState) {
  let state;
  const listeners = new Set();

  const getState = () => state;
  
  const setState = (partial, replace) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      state = replace ? nextState : { ...state, ...nextState };
      listeners.forEach((listener) => listener());
    }
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  // 初始化
  state = createState(setState, getState);

  // 返回 React Hook
  const useStore = (selector = getState) => {
    return useSyncExternalStore(
      subscribe,
      () => selector(state)
    );
  };

  useStore.getState = getState;
  useStore.setState = setState;
  useStore.subscribe = subscribe;

  return useStore;
}

// 使用方式与官方完全一致
const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));
```

---

## 参考资源

- [Zustand 官方文档](https://docs.pmnd.rs/zustand)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [React 状态管理对比](https://docs.pmnd.rs/zustand/getting-started/comparison)
- [useSyncExternalStore RFC](https://github.com/reactwg/react-18/discussions/86)
