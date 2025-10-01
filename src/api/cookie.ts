/*
 * @Author: Paner luh1@xiaopeng.com
 * @Date: 2025-10-01 11:30:17
 * @LastEditors: Paner luh1@xiaopeng.com
 * @LastEditTime: 2025-10-01 11:33:57
 * @FilePath: \moo\MOO-music\src\api\cookie.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import request from '@/utils/request'

// Cookie数据接口定义
export interface CookieInfo {
  userId: string
  userInfo: {
    nickname?: string
    avatarUrl?: string
    loginTime?: string
    loginType?: string
  }
  createdAt: string
  lastUsed: string
}

export interface CookieListResponse {
  code: number
  data: CookieInfo[]
  message: string
}

export interface CookieGetResponse {
  code: number
  data: CookieInfo & {
    cookieString?: string
    cookie?: any
  }
  message: string
}

/**
 * 获取所有已保存的cookie列表
 */
export function getCookieList() {
  return request.get<any, CookieListResponse>(`/cookie/list?timestamp=${Date.now()}`)
}

/**
 * 获取指定用户的cookie详情
 * @param userId 用户ID
 * @param includeCookie 是否包含cookie字符串
 */
export function getCookieDetail(userId: string, includeCookie = false) {
  return request.get<any, CookieGetResponse>(
    `/cookie/get?userId=${userId}&includeCookie=${includeCookie}&timestamp=${Date.now()}`
  )
}

/**
 * 删除指定用户的cookie
 * @param userId 用户ID
 */
export function deleteCookie(userId: string) {
  return request.get<any, { code: number; data: { userId: string; deleted: boolean }; message: string }>(
    `/cookie/delete?userId=${userId}&timestamp=${Date.now()}`
  )
}

/**
 * 手动保存cookie
 * @param cookie cookie字符串
 * @param userId 用户ID（可选）
 * @param userInfo 用户信息（可选）
 */
export function saveCookie(cookie: string, userId?: string, userInfo?: any) {
  const params = new URLSearchParams()
  params.append('cookie', cookie)
  if (userId) params.append('userId', userId)
  if (userInfo) params.append('userInfo', JSON.stringify(userInfo))
  
  return request.get<any, { code: number; data: any; message: string }>(
    `/cookie/save?${params.toString()}&timestamp=${Date.now()}`
  )
}

/**
 * 清理过期的cookie
 * @param maxAge 最大保存天数，默认30天
 */
export function cleanExpiredCookies(maxAge = 30) {
  return request.get<any, { code: number; data: { cleanedCount: number; maxAge: number }; message: string }>(
    `/cookie/clean?maxAge=${maxAge}&timestamp=${Date.now()}`
  )
}