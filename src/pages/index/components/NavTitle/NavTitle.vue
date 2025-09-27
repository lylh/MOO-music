<template>
  <view class="bg-black-2 text-white-1 text-[70rpx] px-[28rpx] pb-[20rpx] relative overflow-visible">
    <view class="flex justify-between items-center">
      <text>{{ isHome ? 'DISCOVER' : 'PROFILE' }}</text>

      <JIcon
        v-if="!userStore.profile"
        :class="{'hidden': !isHome}"
        class="icon-user text-white-1 text-[60rpx]"
        @click="useNavigateTo('/sharedPages/login/login')"
      />
      
      <!-- 头像下拉菜单容器 -->
      <view 
        v-else
        :class="{'hidden': !isHome}"
        class="profile-area relative"
        @click.stop="toggleDropdown"
      >
        <JImage
          :src="userStore.profile.avatarUrl"
          width="75rpx"
          height="75rpx"
          radius="50%"
          class="cursor-pointer transition-opacity duration-200 hover:opacity-80"
        />
        
        <!-- 下拉菜单 -->
        <view
          v-show="showDropdown"
          class="dropdown-menu fixed bg-black-1 rounded-[20rpx] shadow-2xl border border-grey-2 min-w-[300rpx] z-[99999] overflow-hidden"
          :style="dropdownStyle"
          @click.stop
        >
          <view 
            class="dropdown-item px-6 py-4 text-white-1 cursor-pointer border-b border-grey-2 flex items-center transition-colors duration-200"
            @tap="handleMenuClick('profile')"
          >
            <JIcon type="icon-user" class="mr-3 text-[36rpx]" />
            <text class="text-[32rpx]">个人资料</text>
          </view>
          <view 
            class="dropdown-item px-6 py-4 text-white-1 cursor-pointer border-b border-grey-2 flex items-center transition-colors duration-200"
            @tap="handleMenuClick('settings')"
          >
            <JIcon type="icon-setting" class="mr-3 text-[36rpx]" />
            <text class="text-[32rpx]">设置</text>
          </view>
          <view 
            class="dropdown-item px-6 py-4 text-white-1 cursor-pointer flex items-center transition-colors duration-200"
            @tap="handleMenuClick('logout')"
          >
            <JIcon type="icon-exit" class="mr-3 text-[36rpx]" />
            <text class="text-[32rpx]">退出登录</text>
          </view>
        </view>
      </view>

      <JIcon
        :class="{'hidden': isHome}"
        type="icon-setting"
        class="text-white-1 text-[60rpx]"
      />
    </view>

    <view class="flex">
      <view
        v-for="item in pages"
        :key="item"
        :class="currentPage === item ? 'w-[36rpx] !rounded-[20rpx] bg-white-1' : ''"
        class="w-[18rpx] h-[18rpx] bg-grey-1 rounded-[50%] mr-1 transition-[width] duration-500 ease-in-out"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import toast from '@/utils/toast'

const props = defineProps<{
  pages: string[]
  currentPage: string
}>()

const userStore = useUserStore()
const isHome = computed(() => props.currentPage === 'home')

// 下拉菜单状态
const showDropdown = ref(false)
const dropdownStyle = ref({})

// 切换下拉菜单显示状态
const toggleDropdown = async () => {
  showDropdown.value = !showDropdown.value
  
  if (showDropdown.value) {
    await nextTick()
    calculateDropdownPosition()
  }
}

// 计算下拉菜单位置
const calculateDropdownPosition = () => {
  try {
    const query = uni.createSelectorQuery()
    query.select('.profile-area').boundingClientRect((rect: any) => {
      if (rect) {
        dropdownStyle.value = {
          top: `${rect.bottom + 10}px`,
          right: `${window.innerWidth - rect.right}px`
        }
      }
    }).exec()
  } catch (error) {
    // 降级方案：使用固定位置
    dropdownStyle.value = {
      top: '120rpx',
      right: '28rpx'
    }
  }
}

// 导航状态管理
const isNavigating = ref(false)

// 处理菜单项点击
const handleMenuClick = async (action: string) => {
  // 防止重复点击导致的导航冲突
  if (isNavigating.value) {
    console.log('导航正在进行中，忽略重复点击')
    return
  }
  
  showDropdown.value = false
  
  switch (action) {
    case 'profile':
      toast.show('个人资料功能开发中')
      break
    case 'settings':
      isNavigating.value = true
      try {
        await uni.navigateTo({
          url: '/pages/index/settings/settings'
        })
      } catch (error) {
        console.error('导航到设置页面失败:', error)
        toast.show('打开设置页面失败')
      } finally {
        // 延迟重置导航状态，防止快速连续点击
        setTimeout(() => {
          isNavigating.value = false
        }, 1000)
      }
      break
    case 'logout':
      toast.start()
      try {
        await userStore.logout()
        toast.show('退出登录成功')
      } catch (error) {
        toast.show('退出登录失败')
      } finally {
        toast.close()
      }
      break
  }
}

// 全局点击事件处理，点击外部关闭下拉菜单
const handleGlobalClick = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.profile-area') && !target.closest('.dropdown-menu')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleGlobalClick)
  document.addEventListener('touchstart', handleGlobalClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick)
  document.removeEventListener('touchstart', handleGlobalClick)
})
</script>

<style scoped>
.profile-area {
  position: relative;
  z-index: 10;
}

.dropdown-menu {
  position: fixed;
  background-color: #1a1a1a;
  border-radius: 20rpx;
  box-shadow: 0 16rpx 64rpx rgba(0, 0, 0, 0.4), 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
  border: 2rpx solid #333;
  min-width: 300rpx;
  z-index: 99999;
  overflow: hidden;
  backdrop-filter: blur(10px);
  animation: dropdownFadeIn 0.2s ease-out;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10rpx) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dropdown-item {
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.dropdown-item:hover {
  background-color: #333;
  transform: translateX(4rpx);
}

.dropdown-item:active {
  background-color: #444;
  transform: translateX(2rpx);
}

.dropdown-item:last-child {
  border-bottom: none;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .dropdown-menu {
    min-width: 280rpx;
  }
  
  .dropdown-item {
    padding: 24rpx 32rpx;
  }
}
</style>
