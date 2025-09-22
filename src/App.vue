<!--
 * @Author: paner 328538688@qq.com
 * @Date: 2025-09-21 10:54:07
 * @LastEditors: paner 328538688@qq.com
 * @LastEditTime: 2025-09-21 18:03:21
 * @FilePath: \MOO-music\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup lang="ts">
onLaunch(async () => {
  console.log('🚀 App Launch 开始')
  
  // 使用uni.showToast显示应用启动信息
  uni.showToast({
    title: '🚀 App Launch 开始',
    icon: 'none',
    duration: 3000
  })
  
  console.log('🔧 当前环境:', {
    platform: uni.getSystemInfoSync().platform,
    environment: process.env.NODE_ENV
  })
  
  // 显示环境信息
  const systemInfo = uni.getSystemInfoSync()
  uni.showToast({
    title: `平台: ${systemInfo.platform}`,
    icon: 'none',
    duration: 2000
  })
  
  // 异步执行setupLogin，捕获Promise异常
  try {
    console.log('🎯 开始执行 setupLogin')
    uni.showToast({
      title: '🎯 开始执行 setupLogin',
      icon: 'none',
      duration: 2000
    })
    await setupLogin()
    console.log('✅ setupLogin 执行成功')
    uni.showToast({
      title: '✅ setupLogin 成功',
      icon: 'success',
      duration: 2000
    })
  } catch (error) {
    console.error('❌ setupLogin 异常:', error)
    uni.showToast({
      title: '❌ setupLogin 异常',
      icon: 'none',
      duration: 3000
    })
  }
  
  // 异步执行setupAudio，捕获Promise异常
  try {
    console.log('🎯 开始执行 setupAudio')
    uni.showToast({
      title: '🎯 开始执行 setupAudio',
      icon: 'none',
      duration: 2000
    })
    setupAudio()
    console.log('✅ setupAudio 执行成功')
    uni.showToast({
      title: '✅ setupAudio 成功',
      icon: 'success',
      duration: 2000
    })
  } catch (error) {
    console.error('❌ setupAudio 异常:', error)
    uni.showToast({
      title: '❌ setupAudio 异常',
      icon: 'none',
      duration: 3000
    })
  }
  
  console.log('✅ App Launch 完成')
  uni.showToast({
    title: '✅ App Launch 完成',
    icon: 'success',
    duration: 2000
  })
})
</script>

<style>
@import '@/styles/index.css';
</style>
