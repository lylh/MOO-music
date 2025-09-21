import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

// 开发环境下导入调试工具
if (process.env.NODE_ENV === 'development') {
  import('./utils/debugConsole')
}

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()

  app.use(pinia)

  return {
    app,
    pinia
  }
}
