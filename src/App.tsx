import { useEffect } from 'react'
import Editor from './components/editor'
import registry from './core/registry'
import { allComponentMetas } from './components/materials'

function App() {
  // 初始化组件注册
  useEffect(() => {
    registry.registerAll(allComponentMetas)
  }, [])

  return <Editor />
}

export default App