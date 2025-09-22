import request from '@/utils/request'
import { MOO_API } from '@/utils/request'
import type { LoginStatusResponse } from '@/api/interface/LoginStatus'

interface Response<T> {
  code: number
  data: T
}

export function createQRKey() {
  return request.get<
    any,
    Response<{unikey: string}>
  >(`/login/qr/key?timestamp=${Date.now()}`)
}

export function createQRImg(key:string) {
  return request.get<
    any,
    Response<{qrimg: string, qrurl: string}>
  >(`/login/qr/create?key=${key}&qrimg=true&timestamp=${Date.now()}`)
}

export function checkQRStatus(key: string) {
  return request.get<
    any,
    {code: 800 | 801 | 802 | 803, cookie: string, message: string}
  >(`/login/qr/check?key=${key}&timestamp=${Date.now()}`)
}

export function getLoginStatus(cookie: string) {
  return request.post<any, LoginStatusResponse>(`/login/status?timestamp=${Date.now()}`, { cookie })
}

export function logout() {
  return request.get<any, {code: number}>(`/logout`)
}
