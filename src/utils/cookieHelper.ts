/**
 * Cookie 辅助工具
 * 用于手动设置和管理网易云音乐的登录cookie
 */

import { setupLogin } from '@/store/user'
import toast from './toast'

/**
 * 手动设置cookie并登录
 * @param cookieString 完整的cookie字符串
 */
export async function setManualCookie(cookieString: string) {
  try {
    // 验证cookie格式
    if (!cookieString.includes('MUSIC_U') || !cookieString.includes('__csrf')) {
      throw new Error('Cookie格式不正确，需要包含MUSIC_U和__csrf字段')
    }

    // 提取需要的cookie字段
    const musicU = cookieString.match(/MUSIC_U=([^;]+)/)?.[0]
    const csrf = cookieString.match(/__csrf=([^;]+)/)?.[0]
    
    if (!musicU || !csrf) {
      throw new Error('无法提取有效的MUSIC_U或__csrf字段')
    }

    const formattedCookie = `${musicU}; ${csrf};`
    
    // 存储cookie
    uni.setStorage({ 
      key: 'cookie', 
      data: formattedCookie,
      success: () => {
        console.log('✅ Cookie已保存:', formattedCookie)
      }
    })

    // 执行登录
    await setupLogin(formattedCookie)
    
    toast.success('登录成功！')
    
    // 跳转到首页
    uni.reLaunch({ url: '/pages/index/index' })
    
    return true
  } catch (error) {
    console.error('❌ 设置Cookie失败:', error)
    toast.fail(`设置Cookie失败: ${error.message}`)
    return false
  }
}

/**
 * 获取当前存储的cookie
 */
export function getCurrentCookie(): string {
  return uni.getStorageSync('cookie') || ''
}

/**
 * 清除cookie并退出登录
 */
export function clearCookie() {
  uni.removeStorage({ key: 'cookie' })
  toast.success('Cookie已清除')
}

/**
 * 验证cookie是否有效
 */
export function validateCookie(cookieString: string): boolean {
  const requiredFields = ['MUSIC_U', '__csrf']
  return requiredFields.every(field => cookieString.includes(field))
}

/**
 * 从浏览器开发者工具获取cookie的指导
 */
export function getCookieInstructions(): string {
  return `
🔧 如何从浏览器获取网易云音乐Cookie：

1. 打开浏览器，访问 https://music.163.com
2. 登录您的网易云音乐账号
3. 按F12打开开发者工具
4. 切换到 Network(网络) 标签页
5. 刷新页面或进行任何操作
6. 找到任意一个请求，查看 Request Headers
7. 复制 Cookie 字段的完整内容
8. 粘贴到应用中使用

⚠️ 注意：Cookie包含敏感信息，请妥善保管！
  `
}

// 开发环境下的调试功能
export const debugCookie = {
  // 打印当前cookie信息
  logCurrentCookie() {
    const cookie = getCurrentCookie()
    console.log('🍪 当前Cookie:', cookie)
    console.log('🔍 Cookie详情:', {
      hasMUSIC_U: cookie.includes('MUSIC_U'),
      has__csrf: cookie.includes('__csrf'),
      length: cookie.length,
      isValid: validateCookie(cookie)
    })
  },
  
  // 测试cookie格式
  testCookieFormat(testCookie: string) {
    console.log('🧪 测试Cookie:', testCookie)
    console.log('✅ 格式验证:', validateCookie(testCookie))
  }
}