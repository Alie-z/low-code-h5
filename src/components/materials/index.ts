import type { ComponentMeta } from '@/types'

/**
 * 按钮组件元数据
 */
export const ButtonMeta: ComponentMeta = {
  type: 'button',
  name: '按钮',
  category: '基础组件',
  icon: '🔘',
  props: [
    { name: 'text', type: 'string', label: '按钮文字', defaultValue: '点击按钮' },
    { 
      name: 'variant', 
      type: 'select', 
      label: '按钮类型',
      options: [
        { label: '主要按钮', value: 'primary' },
        { label: '次要按钮', value: 'secondary' },
        { label: '轮廓按钮', value: 'outline' },
        { label: '文字按钮', value: 'text' }
      ],
      defaultValue: 'primary'
    },
    {
      name: 'size',
      type: 'select',
      label: '按钮尺寸',
      options: [
        { label: '小', value: 'small' },
        { label: '中', value: 'medium' },
        { label: '大', value: 'large' }
      ],
      defaultValue: 'medium'
    },
    { name: 'disabled', type: 'boolean', label: '禁用状态', defaultValue: false },
    { name: 'block', type: 'boolean', label: '块级按钮', defaultValue: false }
  ],
  events: [
    { name: 'onClick', label: '点击事件', description: '按钮被点击时触发' }
  ],
  defaultProps: {
    text: '点击按钮',
    variant: 'primary',
    size: 'medium',
    disabled: false,
    block: false
  },
  styleProps: [
    { name: 'backgroundColor', type: 'color', label: '背景颜色' },
    { name: 'textColor', type: 'color', label: '文字颜色' },
    { name: 'borderRadius', type: 'size', label: '圆角' }
  ],
  allowChildren: false
}

/**
 * 文本组件元数据
 */
export const TextMeta: ComponentMeta = {
  type: 'text',
  name: '文本',
  category: '基础组件',
  icon: '📝',
  props: [
    { name: 'content', type: 'string', label: '文本内容', defaultValue: '请输入文本内容' },
    {
      name: 'variant',
      type: 'select',
      label: '文本类型',
      options: [
        { label: '标题1', value: 'h1' },
        { label: '标题2', value: 'h2' },
        { label: '标题3', value: 'h3' },
        { label: '正文', value: 'body' },
        { label: '小字', value: 'caption' }
      ],
      defaultValue: 'body'
    },
    {
      name: 'align',
      type: 'select',
      label: '对齐方式',
      options: [
        { label: '左对齐', value: 'left' },
        { label: '居中', value: 'center' },
        { label: '右对齐', value: 'right' }
      ],
      defaultValue: 'left'
    }
  ],
  events: [
    { name: 'onClick', label: '点击事件' }
  ],
  defaultProps: {
    content: '请输入文本内容',
    variant: 'body',
    align: 'left'
  },
  styleProps: [
    { name: 'color', type: 'color', label: '文字颜色' },
    { name: 'fontSize', type: 'size', label: '字体大小' },
    { name: 'fontWeight', type: 'font', label: '字体粗细' },
    { name: 'lineHeight', type: 'size', label: '行高' }
  ],
  allowChildren: false
}

/**
 * 图片组件元数据
 */
export const ImageMeta: ComponentMeta = {
  type: 'image',
  name: '图片',
  category: '基础组件',
  icon: '🖼️',
  props: [
    { name: 'src', type: 'image', label: '图片地址', defaultValue: 'https://via.placeholder.com/300x200' },
    { name: 'alt', type: 'string', label: '替代文本', defaultValue: '图片' },
    {
      name: 'fit',
      type: 'select',
      label: '填充模式',
      options: [
        { label: '覆盖', value: 'cover' },
        { label: '包含', value: 'contain' },
        { label: '填充', value: 'fill' },
        { label: '无', value: 'none' }
      ],
      defaultValue: 'cover'
    },
    { name: 'link', type: 'string', label: '跳转链接', defaultValue: '' }
  ],
  events: [
    { name: 'onClick', label: '点击事件' },
    { name: 'onLoad', label: '加载完成' },
    { name: 'onError', label: '加载失败' }
  ],
  defaultProps: {
    src: 'https://via.placeholder.com/300x200',
    alt: '图片',
    fit: 'cover',
    link: ''
  },
  styleProps: [
    { name: 'width', type: 'size', label: '宽度' },
    { name: 'height', type: 'size', label: '高度' },
    { name: 'borderRadius', type: 'size', label: '圆角' }
  ],
  allowChildren: false
}

/**
 * 容器组件元数据
 */
export const ContainerMeta: ComponentMeta = {
  type: 'container',
  name: '容器',
  category: '布局组件',
  icon: '📦',
  props: [
    {
      name: 'direction',
      type: 'select',
      label: '排列方向',
      options: [
        { label: '水平', value: 'row' },
        { label: '垂直', value: 'column' }
      ],
      defaultValue: 'column'
    },
    {
      name: 'justify',
      type: 'select',
      label: '主轴对齐',
      options: [
        { label: '起始', value: 'flex-start' },
        { label: '居中', value: 'center' },
        { label: '末尾', value: 'flex-end' },
        { label: '两端', value: 'space-between' },
        { label: '环绕', value: 'space-around' }
      ],
      defaultValue: 'flex-start'
    },
    {
      name: 'align',
      type: 'select',
      label: '交叉轴对齐',
      options: [
        { label: '拉伸', value: 'stretch' },
        { label: '起始', value: 'flex-start' },
        { label: '居中', value: 'center' },
        { label: '末尾', value: 'flex-end' }
      ],
      defaultValue: 'stretch'
    },
    { name: 'gap', type: 'number', label: '间距', defaultValue: 8, min: 0, max: 100 },
    { name: 'wrap', type: 'boolean', label: '自动换行', defaultValue: false }
  ],
  events: [],
  defaultProps: {
    direction: 'column',
    justify: 'flex-start',
    align: 'stretch',
    gap: 8,
    wrap: false
  },
  styleProps: [
    { name: 'padding', type: 'spacing', label: '内边距' },
    { name: 'backgroundColor', type: 'color', label: '背景颜色' },
    { name: 'borderRadius', type: 'size', label: '圆角' },
    { name: 'border', type: 'border', label: '边框' }
  ],
  allowChildren: true
}

/**
 * 分割线组件元数据
 */
export const DividerMeta: ComponentMeta = {
  type: 'divider',
  name: '分割线',
  category: '基础组件',
  icon: '➖',
  props: [
    {
      name: 'type',
      type: 'select',
      label: '类型',
      options: [
        { label: '实线', value: 'solid' },
        { label: '虚线', value: 'dashed' },
        { label: '点线', value: 'dotted' }
      ],
      defaultValue: 'solid'
    },
    { name: 'text', type: 'string', label: '文字内容', defaultValue: '' },
    {
      name: 'orientation',
      type: 'select',
      label: '文字位置',
      options: [
        { label: '左侧', value: 'left' },
        { label: '居中', value: 'center' },
        { label: '右侧', value: 'right' }
      ],
      defaultValue: 'center'
    }
  ],
  events: [],
  defaultProps: {
    type: 'solid',
    text: '',
    orientation: 'center'
  },
  styleProps: [
    { name: 'color', type: 'color', label: '线条颜色' },
    { name: 'margin', type: 'spacing', label: '外边距' }
  ],
  allowChildren: false
}

/**
 * 轮播图组件元数据
 */
export const CarouselMeta: ComponentMeta = {
  type: 'carousel',
  name: '轮播图',
  category: '业务组件',
  icon: '🎠',
  props: [
    { 
      name: 'images', 
      type: 'string', 
      label: '图片列表(逗号分隔)', 
      defaultValue: 'https://via.placeholder.com/400x200/3b82f6/ffffff?text=Slide+1,https://via.placeholder.com/400x200/10b981/ffffff?text=Slide+2,https://via.placeholder.com/400x200/f59e0b/ffffff?text=Slide+3'
    },
    { name: 'autoplay', type: 'boolean', label: '自动播放', defaultValue: true },
    { name: 'interval', type: 'number', label: '切换间隔(ms)', defaultValue: 3000, min: 1000, max: 10000 },
    { name: 'showDots', type: 'boolean', label: '显示指示器', defaultValue: true }
  ],
  events: [
    { name: 'onChange', label: '切换事件' }
  ],
  defaultProps: {
    images: 'https://via.placeholder.com/400x200/3b82f6/ffffff?text=Slide+1,https://via.placeholder.com/400x200/10b981/ffffff?text=Slide+2,https://via.placeholder.com/400x200/f59e0b/ffffff?text=Slide+3',
    autoplay: true,
    interval: 3000,
    showDots: true
  },
  styleProps: [
    { name: 'height', type: 'size', label: '高度' },
    { name: 'borderRadius', type: 'size', label: '圆角' }
  ],
  allowChildren: false
}

/**
 * 倒计时组件元数据
 */
export const CountdownMeta: ComponentMeta = {
  type: 'countdown',
  name: '倒计时',
  category: '业务组件',
  icon: '⏰',
  props: [
    { name: 'endTime', type: 'string', label: '结束时间', defaultValue: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
    { name: 'title', type: 'string', label: '标题', defaultValue: '距离活动结束' },
    { name: 'showDays', type: 'boolean', label: '显示天数', defaultValue: true }
  ],
  events: [
    { name: 'onEnd', label: '倒计时结束' }
  ],
  defaultProps: {
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    title: '距离活动结束',
    showDays: true
  },
  styleProps: [
    { name: 'backgroundColor', type: 'color', label: '背景颜色' },
    { name: 'textColor', type: 'color', label: '文字颜色' }
  ],
  allowChildren: false
}

/**
 * 商品卡片组件元数据
 */
export const ProductCardMeta: ComponentMeta = {
  type: 'productCard',
  name: '商品卡片',
  category: '业务组件',
  icon: '🛍️',
  props: [
    { name: 'image', type: 'image', label: '商品图片', defaultValue: 'https://via.placeholder.com/200x200' },
    { name: 'title', type: 'string', label: '商品名称', defaultValue: '商品名称' },
    { name: 'price', type: 'number', label: '价格', defaultValue: 99.00 },
    { name: 'originalPrice', type: 'number', label: '原价', defaultValue: 199.00 },
    { name: 'tag', type: 'string', label: '标签', defaultValue: '热销' }
  ],
  events: [
    { name: 'onClick', label: '点击事件' },
    { name: 'onBuy', label: '购买按钮点击' }
  ],
  defaultProps: {
    image: 'https://via.placeholder.com/200x200',
    title: '商品名称',
    price: 99.00,
    originalPrice: 199.00,
    tag: '热销'
  },
  styleProps: [
    { name: 'backgroundColor', type: 'color', label: '背景颜色' },
    { name: 'borderRadius', type: 'size', label: '圆角' }
  ],
  allowChildren: false
}

/**
 * 所有组件元数据列表
 */
export const allComponentMetas: ComponentMeta[] = [
  ButtonMeta,
  TextMeta,
  ImageMeta,
  ContainerMeta,
  DividerMeta,
  CarouselMeta,
  CountdownMeta,
  ProductCardMeta
]

export default allComponentMetas