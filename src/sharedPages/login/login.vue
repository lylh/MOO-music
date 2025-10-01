<template>
  <Navbar
    title="🎵 登录"
    left-arrow
  />

  <!-- #ifdef H5 -->
  <H5BackTransition
    :ref="(el: any) => el?.open()"
    class="relative w-full !h-4/5"
  >
    <!-- #endif -->
    <view class="z-50 mid">
      <!-- 二维码登录区域 -->
      <view v-if="!showManualLogin && !showCookieList">
        <JImage
          :src="qrimg"
          width="400rpx"
          height="400rpx"
        />

        <button
          class="font-bold bg-primary text-black-1 rounded-full my-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 border-yellow-400"
          :loading="isLoading"
          @tap.stop="toNetease"
        >
          {{ qrimg ? '打开网易云音乐' : '获取二维码中...' }}
        </button>

        <uni-notice-bar
          v-if="qrimg"
          class="rounded-md overflow-hidden"
          show-icon
          text="请手动截图保存后,点击按钮跳转网易云音乐进行扫码（**小程序不支持跳转**）"
        />

        <!-- 登录选项按钮 -->
        <view class="flex flex-col gap-2 mt-4">
          <button
            class="font-bold bg-blue-500 text-white rounded-full text-sm"
            @tap="loadSavedCookies"
          >
            选择已保存的账号登录
          </button>
          <button
            class="font-bold bg-gray-500 text-white rounded-full text-sm"
            @tap="showManualLogin = true"
          >
            手动输入Cookie登录
          </button>
        </view>
      </view>

      <!-- 已保存Cookie列表 -->
      <view v-else-if="showCookieList" class="w-full px-8">
        <view class="text-center mb-6">
          <text class="text-lg font-bold">🍪 选择账号登录</text>
        </view>

        <!-- Cookie列表 -->
        <view v-if="cookieList.length > 0" class="space-y-3">
          <view 
            v-for="cookie in cookieList" 
            :key="cookie.userId"
            class="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
            @tap="selectCookie(cookie)"
          >
            <view class="flex items-center justify-between">
              <view class="flex-1">
                <view class="flex items-center gap-2 mb-2">
                  <text class="text-base font-semibold text-gray-800">
                    {{ cookie.userInfo?.nickname || '未知用户' }}
                  </text>
                  <text class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {{ cookie.userInfo?.loginType || 'unknown' }}
                  </text>
                </view>
                <text class="text-xs text-gray-500">
                  最后使用: {{ formatTime(cookie.lastUsed) }}
                </text>
              </view>
              <view class="flex items-center gap-2">
                <button 
                  class="text-xs bg-red-100 text-red-600 px-3 py-1 rounded"
                  @tap.stop="deleteSavedCookie(cookie.userId)"
                >
                  删除
                </button>
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-else class="text-center py-8">
          <text class="text-gray-500">暂无已保存的账号</text>
        </view>

        <!-- 操作按钮 -->
        <view class="flex gap-2 mt-6">
          <button
            class="flex-1 font-bold bg-gray-500 text-white rounded-full"
            @tap="showCookieList = false"
          >
            返回扫码
          </button>
          <button
            class="flex-1 font-bold bg-blue-500 text-white rounded-full"
            @tap="refreshCookieList"
            :loading="isLoadingCookies"
          >
            刷新列表
          </button>
        </view>
      </view>

      <!-- 手动Cookie登录区域 -->
      <view v-else class="w-full px-8">
        <view class="text-center mb-6">
          <text class="text-lg font-bold">🍪 手动Cookie登录</text>
        </view>

        <textarea
          v-model="manualCookie"
          class="w-full h-32 p-4 border border-gray-300 rounded-lg text-sm"
          placeholder="请粘贴从浏览器获取的完整Cookie..."
          :maxlength="2000"
        />

        <view class="flex gap-2 mt-4">
          <button
            class="flex-1 font-bold bg-green-500 text-white rounded-full"
            :loading="isManualLoading"
            @tap="handleManualLogin"
          >
            确认登录
          </button>
          <button
            class="flex-1 font-bold bg-gray-500 text-white rounded-full"
            @tap="showManualLogin = false"
          >
            返回扫码
          </button>
        </view>

        <button
          class="w-full font-bold bg-blue-500 text-white rounded-full mt-2 text-sm"
          @tap="showCookieHelp"
        >
          如何获取Cookie？
        </button>

        <uni-notice-bar
          class="rounded-md overflow-hidden mt-4"
          show-icon
          text="Cookie包含敏感信息，请确保来源安全可靠"
        />
      </view>
    </view>
  <!-- #ifdef H5 -->
  </H5BackTransition>
  <!-- #endif -->
</template>

<script setup lang="ts">
import { createQRKey, createQRImg, checkQRStatus } from '@/api/login'
import { getCookieList, getCookieDetail, deleteCookie, type CookieInfo } from '@/api/cookie'
import { setManualCookie, getCookieInstructions } from '@/utils/cookieHelper'
import { setupLogin } from '@/store/user'
import toast from '@/utils/toast'

const qrimg = ref('')
const isLoading = ref(false)

// 手动Cookie登录相关
const showManualLogin = ref(false)
const manualCookie = ref('')
const isManualLoading = ref(false)

// Cookie列表相关
const showCookieList = ref(false)
const cookieList = ref<CookieInfo[]>([])
const isLoadingCookies = ref(false)

let timer: number | undefined
onBeforeUnmount(() => { timer && clearInterval(timer) })

login()

// 加载已保存的Cookie列表
async function loadSavedCookies() {
  isLoadingCookies.value = true
  try {
    const response = await getCookieList()
    if (response.code === 200) {
      console.log('🍪 原始Cookie数据:', response.data)
      
      // 按时间倒序排列 - 优先使用lastUsed，其次createdAt
      const sortedCookies = response.data.sort((a, b) => {
        const timeA = new Date(a.lastUsed || a.createdAt || 0).getTime()
        const timeB = new Date(b.lastUsed || b.createdAt || 0).getTime()
        return timeB - timeA // 倒序：最新的在前
      })
      
      console.log('🍪 排序后Cookie数据:', sortedCookies)
      
      // 去重：同一昵称只保留最新的（第一个）
      const uniqueCookies: CookieInfo[] = []
      const seenNicknames = new Set<string>()
      
      for (const cookie of sortedCookies) {
        const nickname = cookie.userInfo?.nickname || cookie.userId // 如果没有昵称，使用userId作为备用
        if (!seenNicknames.has(nickname)) {
          seenNicknames.add(nickname)
          uniqueCookies.push(cookie)
          console.log('🍪 添加用户:', nickname, '(userId:', cookie.userId, ')')
        } else {
          console.log('🍪 跳过重复昵称:', nickname, '(userId:', cookie.userId, ')')
        }
      }
      
      cookieList.value = uniqueCookies
      showCookieList.value = true
      console.log('🍪 最终Cookie列表 (去重+排序):', cookieList.value)
    } else {
      toast.fail('获取Cookie列表失败')
    }
  } catch (error) {
    console.error('获取Cookie列表失败:', error)
    toast.fail('获取Cookie列表失败')
  } finally {
    isLoadingCookies.value = false
  }
}

// 刷新Cookie列表
async function refreshCookieList() {
  await loadSavedCookies()
  toast.success('列表已刷新')
}

// 选择Cookie登录
async function selectCookie(cookieInfo: CookieInfo) {
  try {
    toast.start('正在登录...')
    
    // 获取完整的Cookie数据
    const response = await getCookieDetail(cookieInfo.userId, true)
    if (response.code === 200 && response.data.cookieString) {
      const cookieString = response.data.cookieString
      
      // 清理定时器
      if (timer) {
        clearInterval(timer)
        timer = undefined
      }
      
      // 执行登录
      await setupLogin(cookieString)
      
      // 保存到本地存储
      uni.setStorage({ key: 'cookie', data: cookieString })
      
      toast.close() // 关闭加载提示
      toast.success(`欢迎回来，${cookieInfo.userInfo?.nickname || '用户'}！`)
      
      // 跳转到首页
      uni.reLaunch({ url: '/pages/index/index' })
    } else {
      toast.close() // 关闭加载提示
      toast.fail('获取Cookie详情失败')
    }
  } catch (error) {
    console.error('Cookie登录失败:', error)
    toast.close() // 关闭加载提示
    toast.fail('登录失败，请重试')
  }
}

// 删除已保存的Cookie
async function deleteSavedCookie(userId: string) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个已保存的账号吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const response = await deleteCookie(userId)
          if (response.code === 200) {
            toast.success('删除成功')
            // 刷新列表
            await loadSavedCookies()
          } else {
            toast.fail('删除失败')
          }
        } catch (error) {
          console.error('删除Cookie失败:', error)
          toast.fail('删除失败')
        }
      }
    }
  })
}

// 格式化时间显示
function formatTime(timeString: string): string {
  const time = new Date(timeString)
  const now = new Date()
  const diff = now.getTime() - time.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  
  return time.toLocaleDateString()
}

// 手动Cookie登录处理
async function handleManualLogin() {
  if (!manualCookie.value.trim()) {
    toast.fail('请输入Cookie')
    return
  }

  isManualLoading.value = true
  
  try {
    const success = await setManualCookie(manualCookie.value.trim())
    if (success) {
      // 登录成功，清理定时器
      if (timer) {
        clearInterval(timer)
        timer = undefined
      }
    }
  } catch (error) {
    console.error('手动登录失败:', error)
  } finally {
    isManualLoading.value = false
  }
}

// 显示Cookie获取帮助
function showCookieHelp() {
  const instructions = getCookieInstructions()
  
  uni.showModal({
    title: '获取Cookie指南',
    content: instructions,
    showCancel: false,
    confirmText: '我知道了'
  })
}

async function login() {
  isLoading.value = true

  const { data: { unikey }} = await createQRKey()
  console.log('🚀 ~ file: index.vue:73 ~ qr/key ~ :', unikey)
  const { data: { qrimg: _qrimg }} = await createQRImg(unikey)
  qrimg.value = _qrimg

  timer = setInterval(async() => {
    const { code, cookie } = await checkQRStatus(unikey)
    console.log('🚀 ~ file: login.vue:54 ~ timer=setInterval ~ checkQRStatus:', { code, cookie })

    switch (code) {
      case 800: {
        toast.fail('二维码已过期,请重新获取')
        clearInterval(timer)
        isLoading.value = false
        qrimg.value = ''
        break
      }
      case 803: { // * 这一步会返回cookie
        clearInterval(timer)

        // ! 截取需要的"cookie"小程序端不会自动发送cookie  ps: cookie是以分号加空格进行分割的
        const cookies = cookie.match(/MUSIC_U=?\w+\;/)![0] + ' ' + cookie.match(/__csrf=?\w+\;/)![0]
        console.log('🚀 ~ file: login.vue:80 ~ cookies:', cookies)

        setupLogin(cookie) // ! 执行登录
        uni.setStorage({ key: 'cookie', data: cookies })
        uni.reLaunch({ url: '/pages/index/index' })
        break
      }
    }
  }, 3000)
}

function toNetease() {
  // #ifdef H5
  H5ToNetease()
  // #endif

  // #ifdef APP-PLUS
  APPToNetease()
  // #endif

  // ! 小程序跳不了...
}

// #ifdef H5
function H5ToNetease() {
  // * 提前创建一个定时器作为结果预测提示
  const timer = setTimeout(() => {
    console.error('跳转失败。。。')
    toast.fail('如果跳转失败请手动打开')
  }, 3000)

  // * 添加一个"visibilitychange"事件用于判断是否发生了跳转
  document.addEventListener('visibilitychange', onChange)
  function onChange() {
    if (document.hidden) {
      console.log('跳转APP')
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onChange)
    }
  }

  // * 跳转APP
  window.location.href = 'orpheus://'
}
// #endif

// #ifdef APP-PLUS
function APPToNetease() {
  const scheme = 'orpheuswidget://'
  const packageName = 'com.netease.cloudmusic'

  if (!plus.runtime.isApplicationExist({ action: scheme, pname: packageName })) {
    console.error('网易云音乐APP未安装')
    toast.fail('请安装网易云音乐')
    return
  }

  function error(e: any) {
    console.error('打开网易云音乐失败: ' + e.message)
    toast.fail('打开网易云音乐失败, 请自行启动')
  }

  if (plus.os.name === 'Android') {
    plus.runtime.launchApplication({ pname: packageName }, error)
  } else if (plus.os.name === 'iOS') {
    plus.runtime.launchApplication({ action: scheme }, error)
  }
}
// #endif
</script>
