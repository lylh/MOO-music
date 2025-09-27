<template>
  <view class="settings-page bg-black-2 min-h-screen relative">
    <!-- 顶部导航栏 -->
    <view class="navbar flex items-center justify-between px-6 py-4 bg-gradient-to-r from-black-2 to-black-3 border-b border-grey-3 shadow-lg" style="z-index: 100;">
      <view class="flex items-center">
        <view 
          class="back-btn flex items-center justify-center w-[80rpx] h-[80rpx] bg-white bg-opacity-20 rounded-full mr-4 cursor-pointer hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm border border-grey-3"
          @click="goBack"
        >
          <JIcon 
            type="icon-arrow-left" 
            class="text-white text-[32rpx] font-bold"
          />
        </view>
        <text class="text-white text-[36rpx] font-semibold">设置</text>
      </view>
    </view>

    <!-- 设置内容 -->
    <view class="settings-content px-6 py-6" style="position: relative;">
      <!-- 音质设置 -->
      <view class="setting-section mb-8">
        <view class="section-title text-white text-[32rpx] font-semibold mb-4 flex items-center">
          <view class="w-[8rpx] h-[32rpx] bg-primary rounded-full mr-3"></view>
          音质设置
        </view>
        <!-- 为包含下拉的卡片在下拉打开时提升堆叠层级，避免被底部 fixed 的 PlayController 遮挡 -->
        <view class="setting-item bg-gradient-to-r from-black-3 to-grey-3 rounded-[24rpx] p-6 shadow-xl border border-grey-3 border-opacity-50" :class="{ elevated: isDropdownOpen }">
          <view class="flex items-center justify-between mb-4">
            <text class="text-white text-[30rpx] font-medium">默认音质</text>
          </view>
          
          <!-- 下拉框 -->
          <view class="quality-dropdown relative" style="z-index: 1000;">
            <!-- 下拉框触发器 -->
            <view 
              class="dropdown-trigger flex items-center justify-between bg-grey-1 bg-opacity-20 rounded-[20rpx] px-5 py-4 cursor-pointer border border-grey-1 border-opacity-30 hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm"
              @tap="toggleDropdown"
            >
              <view class="flex items-center">
                <text class="text-white text-[30rpx] font-medium">{{ qualityLabels[selectedQuality] }}</text>
                <text class="text-grey-1 text-[26rpx] ml-3 bg-primary bg-opacity-20 px-2 py-1 rounded-[8rpx]">{{ qualityDescriptions[selectedQuality] }}</text>
              </view>
              <JIcon 
                :type="isDropdownOpen ? 'icon-arrow-up' : 'icon-arrow-down'" 
                class="text-white text-[28rpx] transition-transform duration-300"
                :class="{ 'rotate-180': isDropdownOpen }"
              />
            </view>
            
            <!-- 下拉选项 -->
            <view 
              v-if="isDropdownOpen"
              class="dropdown-options absolute left-0 right-0 bg-grey-2 bg-opacity-98 rounded-[20rpx] mt-3 shadow-2xl overflow-hidden border border-grey-1 border-opacity-30 backdrop-blur-lg"
              style="z-index: 9999999;"
            >
              <view 
                v-for="(label, key) in qualityLabels" 
                :key="key"
                class="dropdown-option flex items-center justify-between px-5 py-4 border-b border-grey-3 border-opacity-50 last:border-b-0 cursor-pointer hover:bg-primary hover:bg-opacity-20 transition-all duration-200"
                :class="{ 'bg-primary bg-opacity-30': selectedQuality === key }"
                @tap="selectQuality(key)"
              >
                <view class="flex items-center">
                  <text class="text-white text-[30rpx] font-medium">{{ label }}</text>
                  <text class="text-grey-1 text-[26rpx] ml-3 bg-grey-1 bg-opacity-30 px-2 py-1 rounded-[8rpx]">{{ qualityDescriptions[key] }}</text>
                </view>
                <JIcon 
                  v-if="selectedQuality === key"
                  type="icon-check" 
                  class="text-primary text-[32rpx] font-bold"
                />
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 其他设置项 -->
      <view class="setting-section mb-8">
        <view class="section-title text-white text-[32rpx] font-semibold mb-4 flex items-center">
          <view class="w-[8rpx] h-[32rpx] bg-primary rounded-full mr-3"></view>
          播放设置
        </view>
        <view class="setting-item bg-gradient-to-r from-grey-3 to-grey-2 rounded-[24rpx] p-6 shadow-xl border border-grey-2 border-opacity-30">
          <view class="flex items-center justify-between py-3">
            <view class="flex items-center">
              <text class="text-white text-[30rpx] font-medium">自动播放</text>
              <text class="text-white text-[24rpx] ml-2 opacity-70">开启后将自动播放下一首</text>
            </view>
            <switch 
              :checked="autoPlay" 
              @change="toggleAutoPlay"
              color="#ff6b35"
              class="transform scale-110"
            />
          </view>
        </view>
      </view>

      <!-- 缓存设置 -->
      <view class="setting-section mb-8">
        <view class="section-title text-white text-[32rpx] font-semibold mb-4 flex items-center">
          <view class="w-[8rpx] h-[32rpx] bg-primary rounded-full mr-3"></view>
          缓存设置
        </view>
        <view class="setting-item bg-gradient-to-r from-grey-3 to-grey-2 rounded-[24rpx] p-6 shadow-xl border border-grey-2 border-opacity-30">
          <view class="flex items-center justify-between py-4 border-b border-grey-2 border-opacity-50">
            <view class="flex items-center">
              <text class="text-white text-[30rpx] font-medium">清除缓存</text>
              <text class="text-white text-[24rpx] ml-2 opacity-70">清除所有本地缓存数据</text>
            </view>
            <view 
              class="clear-cache-btn flex items-center justify-center bg-gradient-to-r from-primary to-orange-500 text-white text-[28rpx] font-semibold px-4 py-2 rounded-[12rpx] cursor-pointer hover:opacity-90 transition-all duration-200 w-[140rpx] whitespace-nowrap"
              @tap="clearCache"
            >
              <JIcon type="icon-delete" class="text-white text-[28rpx] mr-2" />
              清除
            </view>
          </view>

          <view class="flex items-center justify-between py-4">
            <view class="flex items-center">
              <text class="text-white text-[30rpx] font-medium">缓存大小</text>
              <text class="text-white text-[24rpx] ml-2 opacity-70">当前占用空间</text>
            </view>
            <view class="flex items-center justify-center bg-gradient-to-r from-primary to-orange-500 text-white text-[28rpx] font-semibold px-4 py-2 rounded-[12rpx] cursor-pointer hover:opacity-90 transition-all duration-200 w-[140rpx] whitespace-nowrap">
              <JIcon type="icon-storage" class="text-white text-[28rpx] mr-2" />
              {{ cacheSize }}
            </view>
          </view>
        </view>
      </view>

      <!-- 关于 -->
      <view class="setting-section mb-8">
        <view class="section-title text-white text-[32rpx] font-semibold mb-4 flex items-center">
          <view class="w-[8rpx] h-[32rpx] bg-primary rounded-full mr-3"></view>
          关于
        </view>
        <view class="setting-item bg-gradient-to-r from-grey-3 to-grey-2 rounded-[24rpx] p-6 shadow-xl border border-grey-2 border-opacity-30">
          <view class="flex items-center justify-between py-4">
            <view class="flex flex-col">
              <text class="text-white text-[30rpx] font-medium">MOO 音乐</text>
              <text class="text-white text-[24rpx] opacity-70">版本 1.7.0</text>
            </view>
            <view class="flex items-center justify-center bg-gradient-to-r from-primary to-orange-500 text-white text-[28rpx] font-semibold px-4 py-2 rounded-[12rpx] cursor-pointer hover:opacity-90 transition-all duration-200 w-[140rpx] whitespace-nowrap">
              <JIcon type="icon-info" class="text-white text-[28rpx] mr-2" />
              v1.7.0
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import useCache from '@/hooks/useCache'
import { useAudioStore } from '@/store/audio'
import toast from '@/utils/toast'

const audioStore = useAudioStore()

// 下拉框状态
const isDropdownOpen = ref(false)

// 音质选项定义
const qualityLabels = {
  'standard': '标准音质',
  'higher': '较高音质', 
  'exhigh': '极高音质',
  'lossless': '无损音质',
  'hires': 'Hi-Res音质',
  'jyeffect': '高清环绕声',
  'sky': '沉浸环绕声',
  'jymaster': '超清母带'
}

const qualityDescriptions = {
  'standard': '128kbps',
  'higher': '192kbps',
  'exhigh': '320kbps', 
  'lossless': 'FLAC',
  'hires': 'Hi-Res',
  'jyeffect': '环绕声',
  'sky': '沉浸式',
  'jymaster': '母带级'
}

// 使用audio store中的音质设置
const selectedQuality = computed({
  get: () => {
    return audioStore.audioQuality
  },
  set: (value) => {
    audioStore.audioQuality = value
  }
})
const autoPlay = useCache('autoPlay', ref(true))
const cacheSize = ref('0 MB')

// 切换下拉框显示状态
function toggleDropdown() {
  console.log('🔧 toggleDropdown 被调用')
  console.log('🔧 当前 isDropdownOpen:', isDropdownOpen.value)
  
  isDropdownOpen.value = !isDropdownOpen.value
  console.log('🔧 设置 isDropdownOpen:', isDropdownOpen.value)
}

// 选择音质
function selectQuality(quality: keyof typeof qualityLabels) {
  selectedQuality.value = quality
  isDropdownOpen.value = false // 选择后关闭下拉框
  toast.success(`已设置为${qualityLabels[quality]}`)
}

// 切换自动播放
function toggleAutoPlay(e: any) {
  autoPlay.value = e.detail.value
  toast.success(autoPlay.value ? '已开启自动播放' : '已关闭自动播放')
}

// 清除缓存
function clearCache() {
  uni.showModal({
    title: '确认清除',
    content: '确定要清除所有缓存数据吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除缓存逻辑
        try {
          uni.clearStorageSync()
          toast.success('缓存已清除')
          cacheSize.value = '0 MB'
        } catch (error) {
          toast.fail('清除缓存失败')
        }
      }
    }
  })
}

// 返回上一页
function goBack() {
  uni.navigateBack()
}

// 计算缓存大小
function calculateCacheSize() {
  try {
    const info = uni.getStorageInfoSync()
    const size = info.currentSize || 0
    cacheSize.value = size > 1024 ? `${(size / 1024).toFixed(1)} MB` : `${size} KB`
  } catch (error) {
    cacheSize.value = '0 MB'
  }
}

onMounted(() => {
  calculateCacheSize()
})
</script>

<style scoped>
.settings-page {
  background: linear-gradient(180deg, #1a191b 0%, #0f0e10 100%);
  min-height: 100vh;
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
  background: rgba(26, 25, 27, 0.9);
}

.back-btn {
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.2);
}

.back-btn:hover {
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.3);
  transform: translateY(-2px);
}

.setting-section {
  animation: fadeInUp 0.4s ease-out;
}

.setting-section:nth-child(2) {
  animation-delay: 0.1s;
}

.setting-section:nth-child(3) {
  animation-delay: 0.2s;
}

.setting-section:nth-child(4) {
  animation-delay: 0.3s;
}

.setting-section:nth-child(5) {
  animation-delay: 0.4s;
}

.setting-item {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

/* 下拉展开时提升包含卡片的层级，突破 backdrop-filter 创建的堆叠上下文限制 */
.elevated {
  position: relative;
  z-index: 2000;
}

.setting-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.section-title {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.dropdown-trigger {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.dropdown-trigger:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.dropdown-options {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5);
  animation: slideDown 0.3s ease-out;
}

.dropdown-option:hover {
  transform: translateX(8px);
}

.clear-cache-btn {
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.3);
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #e74c3c 100%);
}

.clear-cache-btn:hover {
  box-shadow: 0 8px 32px rgba(255, 107, 53, 0.5);
  background: linear-gradient(135deg, #ff7b45 0%, #f8a32e 50%, #e85c4c 100%);
}

.clear-cache-btn:active {
  transform: scale(0.98);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-content {
    padding: 16px;
  }
  
  .setting-item {
    padding: 20px;
  }
}

/* 深色主题增强 */
.setting-item {
  background: linear-gradient(135deg, 
    rgba(45, 45, 48, 0.8) 0%, 
    rgba(35, 35, 38, 0.9) 50%, 
    rgba(25, 25, 28, 0.95) 100%);
}

/* 主题色彩增强 */
.text-primary {
  color: #ff6b35 !important;
  text-shadow: 0 0 8px rgba(255, 107, 53, 0.3);
}

/* 开关样式增强 */
switch {
  filter: drop-shadow(0 2px 8px rgba(255, 107, 53, 0.3));
}

/* 图标增强 */
.JIcon {
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3));
}

/* 强制文字颜色为白色 */
.settings-page text {
  color: white !important;
}

.settings-page .text-white {
  color: white !important;
}
</style>