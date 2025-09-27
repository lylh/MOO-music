/*
 * @Author: paner 328538688@qq.com
 * @Date: 2025-09-21 10:54:07
 * @LastEditors: paner 328538688@qq.com
 * @LastEditTime: 2025-09-27 17:39:09
 * @FilePath: \MOO-music\src\api\home.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import request from '@/utils/request'
import { MOO_API } from '@/utils/request'
import type { BannerResponse } from './interface/Banner'
import type { RecommendResponse } from './interface/Recommend'
import type { RecommendSongsResponse } from './interface/RecommendSongs'
import type { NewSongResponse } from './interface/NewSong'
import type { NewAlbumResponse } from './interface/NewAlbum'
import type { SonglistResponse } from './interface/Songlist'

export { getPlaylist } from './playlist'

/**
 * @description 获取轮播图
 * @param type: 0 pc, 1 android, 2 iphone, 3 ipad（默认：2）
*/
export function getBanner(type: 0 | 1 | 2 | 3 = 2) {
  return request.get<any, BannerResponse>(`/banner?type=${type}`)
}

// * 获取推荐歌单
export function getRecommend(limit: number) {
  return request.get<any, RecommendResponse>(`/personalized?limit=${limit}`)
}

// * 获取私人推荐歌单
export function getPersonalRecommend() {
  return request.get<any, RecommendResponse>(`/recommend/resource?timestamp=${Date.now()}`,
    {
      // #ifdef MP-WEIXIN
      header: { cookie: uni.getStorageSync('cookie') || '' }
      // #endif
    })
}

// * 获取私人推荐歌曲
export function getRecommendSongs() {
  return request.get<any, RecommendSongsResponse>(`/recommend/songs?timestamp=${Date.now()}`,
    {
      // #ifdef MP-WEIXIN
      header: { cookie: uni.getStorageSync('cookie') || '' }
      // #endif
    })
}

// * 获取新歌单
export function getNewSonglist(offset: number, limit: number) {
  return request.get<any, SonglistResponse>(`/top/playlist?limit=${limit}&order=hot&offset=${offset}`)
}

// * 获取新歌
export function getNewSong() {
  return request.get<any, NewSongResponse>(`/personalized/newsong`)
}

// * 获取新专辑
export function getNewAlbum() {
  return request.get<any, NewAlbumResponse>(`/album/newest`)
}
