<template>
  <Subtitle
    title="MOO Tag_探索标签"
    clickable
    icon="icon-fresh"
  />

  <button
    v-for="tag in tags"
    :key="tag"
    size="mini"
    class="font-bold bg-primary text-black-1 rounded-full mr-[20rpx] mb-[20rpx] shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 border border-yellow-400"
    @tap="useNavigateTo(`/sharedPages/searchSongs/searchSongs?keyword=${tag}`)"
  >
    #{{ tag }}
  </button>
</template>

<script setup lang="ts">
const tags = ['流行音乐奖', 'Contemporary R&B', '朋友圈', '新城劲爆颁奖礼',
  '千禧曼波', '新城国语力颁奖礼', '太能说了', 'New Wave', '活下去']
</script>
