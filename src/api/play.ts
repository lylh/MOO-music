/*
 * @Author: paner 328538688@qq.com
 * @Date: 2025-09-21 10:54:07
 * @LastEditors: paner 328538688@qq.com
 * @LastEditTime: 2025-09-27 17:08:26
 * @FilePath: \MOO-music\src\api\play.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import request from '@/utils/request'
import { MOO_API } from '@/utils/request'
import type { SongURLResponse } from './interface/SongURL'
import type { LyricResponse } from './interface/Lyric'
import type { SimiSongsResponse } from './interface/SimiSongs'

/**
 * @description 获取歌曲url
 * @param id 音乐id
 * @param level 播放音质等级, 分为 standard => 标准,higher => 较高, exhigh=>极高, lossless=>无损, hires=>Hi-Res, jyeffect => 高清环绕声, sky => 沉浸环绕声, jymaster => 超清母带
 */
export function getSongURL(id: number, level: 'standard' | 'higher' | 'exhigh' | 'lossless' | 'hires' | 'jyeffect' | 'sky' | 'jymaster' = 'standard') {
  return request.get<any, SongURLResponse>(`/song/url/v1?id=${id}&level=${level}`,
    {
    // #ifdef MP-WEIXIN
      header: { cookie: uni.getStorageSync('cookie') || '' }
    // #endif
    })
}

/**
 * @description 获取歌曲歌词
 * @param id 歌曲id
 */
export function getLyric(id: number) {
  return request.get<any, LyricResponse>(`/lyric?id=${id}`)
}

/**
 * @description 获取相似歌曲
 * @param id 歌曲id
 */
export async function getSimiSongs(id: number) {
  const { songs } = await request.get<any, SimiSongsResponse>(`/simi/song?id=${id}`)
  console.log('🚀 ~ file: play.ts:36 ~ getSimiSongs ~ songs:', songs)

  return songs.map(item => ({
    id: item.id,
    name: item.name,
    ar: item.artists,
    al: item.album
  }))
}
