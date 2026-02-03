import { useRef } from 'react'
import useBuilderStore from '@/store/builder'
import type { PageSchema } from '@/types'

/**
 * 工具栏组件
 */
export default function Toolbar() {
  const {
    currentPage,
    previewMode,
    zoom,
    deviceMode,
    setPreviewMode,
    setZoom,
    setDeviceMode,
    setPageTitle,
    exportPage,
    loadPage,
    clearPage,
    undo,
    redo,
    history,
    historyIndex
  } = useBuilderStore()

  const fileInputRef = useRef<HTMLInputElement>(null)

  // 导出JSON
  const handleExport = () => {
    const pageData = exportPage()
    const jsonStr = JSON.stringify(pageData, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentPage.title || 'page'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 导入JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const pageData = JSON.parse(event.target?.result as string) as PageSchema
        loadPage(pageData)
      } catch {
        alert('导入失败：无效的JSON文件')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const canUndo = historyIndex >= 0
  const canRedo = historyIndex < history.length - 1

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 gap-4">
      {/* 左侧：页面标题 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-primary-500 text-xl">📱</span>
          <input
            type="text"
            value={currentPage.title}
            onChange={(e) => setPageTitle(e.target.value)}
            className="font-medium text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 w-40"
            placeholder="页面标题"
          />
        </div>

        {/* 撤销/重做 */}
        <div className="flex items-center border-l border-gray-200 pl-4 gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="撤销"
          >
            ↩️
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="重做"
          >
            ↪️
          </button>
        </div>
      </div>

      {/* 中间：设备模式和缩放 */}
      <div className="flex items-center gap-4">
        {/* 设备模式 */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          {(['mobile', 'tablet', 'desktop'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setDeviceMode(mode)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                deviceMode === mode
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {mode === 'mobile' ? '📱' : mode === 'tablet' ? '📟' : '💻'}
            </button>
          ))}
        </div>

        {/* 缩放控制 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(zoom - 10)}
            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"
          >
            −
          </button>
          <span className="text-sm text-gray-600 w-12 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(zoom + 10)}
            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"
          >
            +
          </button>
        </div>
      </div>

      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-2">
        <button
          onClick={clearPage}
          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          清空
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          导入
        </button>
        
        <button
          onClick={handleExport}
          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          导出
        </button>

        <button
          onClick={() => setPreviewMode(!previewMode)}
          className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
            previewMode
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
        >
          {previewMode ? '退出预览' : '预览'}
        </button>
      </div>
    </div>
  )
}