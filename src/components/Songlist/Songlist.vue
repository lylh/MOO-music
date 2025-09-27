<!--
 * @Author: paner 328538688@qq.com
 * @Date: 2025-09-21 14:44:06
 * @LastEditors: paner 328538688@qq.com
 * @LastEditTime: 2025-09-27 17:44:08
 * @FilePath: \MOO-music\src\components\Songlist\Songlist.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <view class="animate-enter-content w-auto flex justify-between flex-wrap overflow-hidden">
    <view
      v-for="item in songlist"
      :key="item.id"
      class="animate-content w-[48%] h-[420rpx] mb-[20rpx] rounded-[20rpx] font-bold text-white-1 relative bg-gradient-to-b from-black-3 to-black-2 border border-grey-3 shadow-lg hover:shadow-2xl hover:scale-105 hover:border-yellow-400 transition-all duration-300 backdrop-blur-sm"
      @click="$emit('click',item)"
    >
      <JImage
        :src="item.coverImgUrl + '?param=200y200'"
        width="100%"
        height="322rpx"
        radius="20rpx"
        lazy-load
      />
      <JIcon class="icon-music text-grey-2 text-[42rpx] bg-white-1 p-[4rpx] rounded-[50%] !absolute right-[3%] top-[60%]" />
      <text class="line-clamp-2 p-2 text-white-1 text-[28rpx] font-medium">{{ item.name }}</text>
    </view>
  </view>
</template>

// #ifdef MP-WEIXIN
<script lang="ts">
export default {
  options: {
    virtualHost: true
  }
}
</script>
// #endif

<script setup lang="ts">
import type { Songlist } from '@/api/interface/Songlist'

defineProps<{
  songlist: Songlist[]
}>()

defineEmits<{
  (e: 'click', item: Songlist): void
}>()
</script>
