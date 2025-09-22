/*
 * @Author: paner 328538688@qq.com
 * @Date: 2025-09-21 14:44:06
 * @LastEditors: paner 328538688@qq.com
 * @LastEditTime: 2025-09-21 17:51:07
 * @FilePath: \MOO-music\src\main.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

// 开发环境下导入调试工具
if (process.env.NODE_ENV === 'development') {
  import('./utils/debugConsole')
}

// 添加全局异常处理和调试日志
console.log('🚀 Main.ts 开始执行')

// 使用uni.showToast显示调试信息（确保在uni-app环境下可见）
if (typeof uni !== 'undefined') {
  uni.showToast({
    title: '🚀 Main.ts 开始执行',
    icon: 'none',
    duration: 2000
  })
}

// 捕获未处理的Promise异常
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ 未处理的Promise异常:', event.reason)
    console.error('❌ Promise:', event.promise)
    if (typeof uni !== 'undefined') {
      uni.showToast({
        title: '❌ Promise异常',
        icon: 'none',
        duration: 3000
      })
    }
    // 阻止默认的异常处理
    event.preventDefault()
  })

  // 捕获全局JavaScript异常
  window.addEventListener('error', (event) => {
    console.error('❌ 全局JavaScript异常:', event.error)
    console.error('❌ 文件:', event.filename, '行号:', event.lineno)
    if (typeof uni !== 'undefined') {
      uni.showToast({
        title: '❌ JS异常',
        icon: 'none',
        duration: 3000
      })
    }
  })
}

export function createApp() {
  console.log('🚀 CreateApp 开始执行')
  
  // 使用uni.showToast显示调试信息
  if (typeof uni !== 'undefined') {
    uni.showToast({
      title: '🚀 CreateApp 开始执行',
      icon: 'none',
      duration: 2000
    })
  }
  
  const app = createSSRApp(App)
  const pinia = createPinia()

  app.use(pinia)

  // 添加Vue应用级别的错误处理
  app.config.errorHandler = (err, instance, info) => {
    console.error('❌ Vue应用异常:', err)
    console.error('❌ 组件实例:', instance)
    console.error('❌ 错误信息:', info)
    
    if (typeof uni !== 'undefined') {
      uni.showToast({
        title: '❌ Vue应用异常',
        icon: 'none',
        duration: 3000
      })
    }
  }

  console.log('✅ CreateApp 执行完成')
  
  if (typeof uni !== 'undefined') {
    uni.showToast({
      title: '✅ CreateApp 执行完成',
      icon: 'success',
      duration: 2000
    })
  }

  return {
    app,
    pinia
  }
}
