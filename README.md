# 活动页面低代码搭建系统

一个面向非技术人员的可视化活动页面搭建系统，支持组件拖拽、参数配置和组件联动功能。

## 📋 项目背景

### 业务痛点

在运营活动频繁的业务场景中，传统的页面开发流程存在以下问题：

1. **开发成本高**：每个活动页面都需要前端工程师从零开发，耗时耗力
2. **响应速度慢**：从需求提出到页面上线往往需要数天甚至数周
3. **沟通成本大**：运营人员与技术人员之间存在理解偏差，反复修改
4. **资源浪费**：大量相似的活动页面重复开发，造成人力资源浪费

### 解决方案

构建一套低代码可视化搭建系统，让运营人员能够：
- 通过**拖拽组件**快速搭建活动页面
- 通过**属性面板**配置组件样式和行为
- 实时**预览效果**，所见即所得
- **导出页面配置**，便于复用和迁移

---

## ✨ 项目亮点

### 1. 现代化技术栈

| 技术 | 版本 | 选型理由 |
|------|------|----------|
| **React 19** | 最新版 | 利用并发特性优化拖拽体验，useTransition 实现无阻塞更新 |
| **Vite 6** | 最新版 | 毫秒级热更新，开发体验极佳 |
| **TypeScript 5.6** | 最新版 | 完整的类型安全，降低运行时错误 |
| **TailwindCSS 3.4** | 最新版 | 原子化CSS，快速构建一致性UI |
| **Zustand 4.5** | 最新版 | 轻量级状态管理，代码简洁直观 |
| **@dnd-kit 6.1** | 最新版 | 现代化拖拽方案，支持复杂嵌套场景 |

### 2. 架构设计亮点

```
┌─────────────────────────────────────────────────────────┐
│                  可视化搭建界面                         │
│    (组件面板 + 画布 + 属性配置面板)                    │
└─────────────────────┬───────────────────────────────────┘
                      │ React组件协议
┌─────────────────────▼───────────────────────────────────┐
│                 React组件渲染引擎                       │
│              (统一渲染 + 事件处理)                      │
└─────────────────────┬───────────────────────────────────┘
                      │ JSON Schema
┌─────────────────────▼───────────────────────────────────┐
│                组件配置协议层                           │
│       (组件元数据 + 属性配置 + 事件联动)                │
└─────────────────────────────────────────────────────────┘
```

**核心设计模式：**

- **组件注册中心模式**：统一管理组件元数据，支持动态扩展
- **Schema驱动渲染**：通过JSON Schema描述页面结构，实现跨端一致性
- **Command模式**：撤销/重做功能的优雅实现
- **组合模式**：容器组件支持嵌套，构建复杂布局

### 3. 用户体验亮点

- **实时预览**：修改属性立即生效，所见即所得
- **多设备适配**：一键切换手机/平板/桌面预览
- **智能缩放**：50%-200%自由缩放，适应不同屏幕
- **批量操作**：支持Ctrl+点击多选，批量删除/复制
- **快捷键支持**：撤销(Ctrl+Z)、重做(Ctrl+Shift+Z)等常用操作

### 4. 丰富的组件库

| 分类 | 组件 | 特点 |
|------|------|------|
| 基础组件 | 按钮、文本、图片、分割线 | 高度可配置，支持多种变体 |
| 布局组件 | 容器 | Flex布局，支持嵌套 |
| 业务组件 | 轮播图、倒计时、商品卡片 | 针对活动场景优化 |

### 5. 强大的事件联动系统

支持组件间的事件通信和联动：

| 动作类型 | 说明 | 使用场景 |
|----------|------|----------|
| **设置属性** | 修改目标组件的任意属性 | 点击按钮改变文字内容/颜色 |
| **显示/隐藏** | 控制组件可见性 | 点击展开更多、关闭弹窗 |
| **切换显示** | 切换组件显示/隐藏状态 | 折叠面板、开关效果 |
| **页面跳转** | 跳转到指定URL | 跳转商品详情、外链 |
| **提交/消息** | 显示提示消息 | 表单提交成功提示 |
| **自定义代码** | 执行JavaScript代码 | 复杂业务逻辑 |

---

## 🔧 技术难点与解决方案

### 难点1：复杂的拖拽交互

**挑战：**
- 需要支持从组件面板拖拽新组件到画布
- 需要支持画布内组件的位置调整
- 需要支持嵌套容器内的组件放置
- 拖拽过程需要实时反馈视觉效果

**解决方案：**

```typescript
// 使用 @dnd-kit 的碰撞检测策略
<DndContext
  collisionDetection={pointerWithin}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
>
  {/* 拖拽预览层 */}
  <DragOverlay>
    <DragPreview componentType={draggedType} />
  </DragOverlay>
</DndContext>
```

关键技术点：
- `pointerWithin` 碰撞检测：精确判断放置目标
- `DragOverlay` 拖拽预览：提供平滑的视觉反馈
- 区分 `new`(新增) 和 `move`(移动) 两种拖拽类型

### 难点2：组件树的状态管理

**挑战：**
- 组件支持无限层级嵌套
- 需要高效地查找、更新、删除任意层级的组件
- 状态更新需要保持不可变性(Immutability)

**解决方案：**

```typescript
// 使用 Zustand + Immer 实现优雅的状态管理
export const useBuilderStore = create<BuilderState & BuilderActions>()(
  immer((set, get) => ({
    // 递归查找组件
    findComponentById: (id) => {
      return findComponentInTree(get().currentPage.components, id)
    },
    
    // 更新组件属性 - Immer 自动处理不可变性
    updateComponentProps: (id, props) => {
      set((state) => {
        const component = findComponentInTree(state.currentPage.components, id)
        if (component) {
          component.props = { ...component.props, ...props }
        }
      })
    }
  }))
)
```

关键技术点：
- **Immer** 允许直接"修改"状态，自动生成不可变更新
- 递归辅助函数处理树形结构的CRUD操作
- 分离 `findComponentById` 和 `updateComponent` 职责

### 难点3：组件元数据与渲染解耦

**挑战：**
- 组件配置(Schema)与组件实现(React组件)需要分离
- 支持运行时动态注册新组件
- 属性面板需要根据组件类型自动生成表单

**解决方案：**

```typescript
// 组件元数据定义
interface ComponentMeta {
  type: string;           // 唯一标识
  name: string;           // 显示名称
  props: PropSchema[];    // 属性配置Schema
  defaultProps: Record<string, unknown>;
}

// 组件注册中心 (单例模式)
class ComponentRegistry {
  private components = new Map<string, ComponentMeta>()
  
  register(meta: ComponentMeta): void {
    this.components.set(meta.type, meta)
  }
  
  getComponent(type: string): ComponentMeta | undefined {
    return this.components.get(type)
  }
}

// 组件渲染映射
const componentMap: Record<string, React.ComponentType<any>> = {
  button: MaterialButton,
  text: MaterialText,
  // ... 其他组件
}
```

关键技术点：
- **策略模式**：根据组件类型选择对应的渲染器
- **Schema驱动**：属性面板根据 PropSchema 自动生成表单控件
- **开放封闭原则**：新增组件只需注册，无需修改核心代码

### 难点4：编辑态与预览态切换

**挑战：**
- 编辑态需要显示选中框、操作按钮等辅助元素
- 编辑态需要阻止组件内部的交互(如按钮点击)
- 预览态需要完全模拟真实运行效果

**解决方案：**

```typescript
function EditableWrapper({ instance, children }) {
  const { previewMode, selectedComponentIds } = useBuilderStore()
  
  // 预览模式直接渲染
  if (previewMode) {
    return <>{children}</>
  }
  
  // 编辑模式添加选中框和交互控制
  return (
    <div className={clsx(isSelected && 'ring-2 ring-primary-500')}>
      {/* 组件类型标签 */}
      {isSelected && <div className="absolute -top-6">...</div>}
      
      {/* 阻止内部交互 */}
      <div className="pointer-events-none">
        {children}
      </div>
    </div>
  )
}
```

关键技术点：
- `pointer-events-none` 阻止编辑态下的组件交互
- 条件渲染辅助元素(选中框、标签)
- 状态隔离：预览模式清空选中状态

---

## 📁 项目结构

```
low-code-h5/
├── public/
│   └── vite.svg              # 网站图标
├── src/
│   ├── types/
│   │   └── index.ts          # 核心类型定义
│   ├── core/
│   │   └── registry.ts       # 组件注册中心
│   ├── store/
│   │   └── builder.ts        # Zustand状态管理
│   ├── components/
│   │   ├── materials/
│   │   │   └── index.ts      # 组件元数据定义
│   │   ├── renderer/
│   │   │   ├── index.tsx     # 统一渲染入口
│   │   │   ├── MaterialButton.tsx
│   │   │   ├── MaterialText.tsx
│   │   │   ├── MaterialImage.tsx
│   │   │   ├── MaterialContainer.tsx
│   │   │   ├── MaterialDivider.tsx
│   │   │   ├── MaterialCarousel.tsx
│   │   │   ├── MaterialCountdown.tsx
│   │   │   └── MaterialProductCard.tsx
│   │   └── editor/
│   │       ├── index.tsx       # 编辑器主组件
│   │       ├── ComponentPanel.tsx  # 左侧组件面板
│   │       ├── Canvas.tsx      # 中间画布区域
│   │       ├── PropertyPanel.tsx   # 右侧属性面板
│   │       └── Toolbar.tsx     # 顶部工具栏
│   ├── App.tsx               # 应用入口
│   ├── main.tsx              # 渲染入口
│   └── index.css             # 全局样式
├── index.html                # HTML模板
├── package.json              # 项目依赖
├── tsconfig.json             # TypeScript配置
├── vite.config.ts            # Vite配置
├── tailwind.config.js        # TailwindCSS配置
└── postcss.config.js         # PostCSS配置
```

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装与运行

```bash
# 进入项目目录
cd low-code-h5

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 使用说明

1. **添加组件**：从左侧组件面板拖拽组件到中间画布
2. **选择组件**：点击画布中的组件进行选中
3. **配置属性**：在右侧属性面板修改组件的属性和样式
4. **预览效果**：点击顶部"预览"按钮查看最终效果
5. **导出配置**：点击"导出"保存页面JSON配置

---

## 🔮 未来规划

### 近期计划

- [ ] 组件层级树面板(Outline)
- [ ] 快捷键系统完善(复制/粘贴/删除)
- [ ] 组件模板市场
- [ ] 更多业务组件(表单、优惠券、抽奖等)

### 中期计划

- [x] 事件联动系统(组件间通信) ✅ 已完成
- [ ] 数据源绑定(API接口对接)
- [ ] 协同编辑(多人实时编辑)
- [ ] 版本管理(历史版本回溯)

### 长期计划

- [ ] 自定义组件开发框架
- [ ] 多端适配(小程序、App)
- [ ] AI辅助搭建(智能布局建议)

---
