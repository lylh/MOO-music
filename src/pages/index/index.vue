<!--
 * @Author: paner 328538688@qq.com
 * @Date: 2025-09-21 14:44:06
 * @LastEditors: paner 328538688@qq.com
 * @LastEditTime: 2025-09-21 15:22:18
 * @FilePath: \MOO-music\src\pages\index\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <view class="h-full bg-black-2 flex flex-col justify-stretch overflow-hidden">
    <Navbar :class="{'invisible': isMV}" />

    <NavTitle
      :class="{'invisible': isMV}"
      :pages="pages"
      :current-page="currentPage"
    />

    <Search :class="{'invisible': isMV}" />

    <!-- * 解决小程序真机上swiper使用flex-grow无效的问题 -->
    <view class="bg-black-2 grow relative">
      <swiper
        class="!h-full absolute top-0 left-0 right-0 bottom-0"
        skip-hidden-item-layout
        :current="currentView"
        :duration="200"
        @change="({detail: {current}}: SwiperOnChangeEvent) => currentPage = pages[current]"
      >
        <!-- #ifndef APP-PLUS -->
        <swiper-item>
          <NewMV :is-show="isMV" />
        </swiper-item>
        <!-- #endif -->

        <swiper-item>
          <Home />
        </swiper-item>

        <swiper-item>
          <Profile />
        </swiper-item>
      </swiper>
    </view>
  </view>

  <PlayController :class="{'invisible': isMV}" />
</template>

<script setup lang="ts">
import NavTitle from './components/NavTitle/NavTitle.vue'
import Search from './components/Search/Search.vue'
import Home from './components/Home/Home.vue'
import Profile from './components/Profile/Profile.vue'
import NewMV from './components/NewMV/NewMV.vue'
import type { SwiperOnChangeEvent } from '@uni-helper/uni-app-types'

let currentView = 0
const pages = ['home', 'profile']
const currentPage = ref<typeof pages[number]>('home')

// #ifndef APP-PLUS
currentView = 1
pages.unshift('mv')

const isMV = computed(() => currentPage.value === 'mv')
// #endif

// #ifdef APP-PLUS
// 在 APP-PLUS 环境下定义 isMV 为 false，因为 MV 功能不可用
const isMV = computed(() => false)
// #endif

</script>
