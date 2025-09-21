/**
 * 调试控制台工具
 * 在浏览器控制台中使用：window.MOODebug
 */

import { setManualCookie, getCurrentCookie, clearCookie, validateCookie, getCookieInstructions, debugCookie } from './cookieHelper'

// 全局调试对象
const MOODebug = {
  // Cookie相关
  cookie: {
    // 设置cookie并登录
    set: setManualCookie,
    // 获取当前cookie
    get: getCurrentCookie,
    // 清除cookie
    clear: clearCookie,
    // 验证cookie格式
    validate: validateCookie,
    // 获取帮助说明
    help: getCookieInstructions,
    // 调试功能
    debug: debugCookie
  },
  
  // 快速登录（简化版）
  async quickLogin(cookieString: string) {
    console.log('🚀 开始快速登录...')
    const result = await setManualCookie(cookieString)
    if (result) {
      console.log('✅ 登录成功！')
    } else {
      console.log('❌ 登录失败！')
    }
    return result
  },
  
  // 显示当前登录状态
  status() {
    const cookie = getCurrentCookie()
    const isValid = validateCookie(cookie)
    
    console.log('📊 当前登录状态:')
    console.log('Cookie存在:', !!cookie)
    console.log('Cookie有效:', isValid)
    console.log('Cookie长度:', cookie.length)
    
    if (cookie) {
      console.log('Cookie预览:', cookie.substring(0, 50) + '...')
    }
    
    return {
      hasCookie: !!cookie,
      isValid,
      cookieLength: cookie.length
    }
  },
  
  // 帮助信息
  help() {
    console.log(`
🔧 MOO音乐调试工具使用指南:

基础功能:
- MOODebug.status()                    // 查看登录状态
- MOODebug.quickLogin('your_cookie')   // 快速登录
- MOODebug.cookie.get()                // 获取当前cookie
- MOODebug.cookie.clear()              // 清除cookie

Cookie管理:
- MOODebug.cookie.set('cookie_string') // 设置cookie
- MOODebug.cookie.validate('cookie')   // 验证cookie格式
- MOODebug.cookie.help()               // 获取cookie指南
- MOODebug.cookie.debug.logCurrentCookie() // 调试当前cookie

示例:
MOODebug.quickLogin('MUSIC_U=your_music_u_value; __csrf=your_csrf_value;')
    `)
  }
}

// 在开发环境下挂载到全局
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  window.MOODebug = MOODebug
  console.log('🎵 MOO音乐调试工具已加载！输入 MOODebug.help() 查看使用指南')
}

export default MOODebug