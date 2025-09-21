/*
 * @Author: Paner luh1@xiaopeng.com
 * @Date: 2025-09-18 10:20:11
 * @LastEditors: Paner luh1@xiaopeng.com
 * @LastEditTime: 2025-09-18 10:41:12
 * @FilePath: \MOO-music\src\utils\request.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import simpleAxios from './simpleAxios'
import toast from './toast'

export const BASE_URL = 'https://kele.160622.xyz:14000'
export const MOO_API = BASE_URL

const request = simpleAxios.create({
  baseURL: BASE_URL,
  withCredentials: true
})

/* request.interceptors.request.use(
  (config) => {
    // console.log('🚀 ~ file: request.ts:11 ~ config:', config)
    return config
  }, (err) => {
    toast.fail()
    return Promise.reject(err)
  }) */

request.interceptors.response.use(
  (response) => {
    // console.log('🚀 ~ file: request.ts:20 ~ response:', response)
    const { data } = response
    const code = data.code || data.data?.code

    switch (code) {
      case 800: // * 登录二维码过期
      case 801: // * 等待扫码
      case 802: // * 待确认
      case 803: // * 授权登录成功
      case 200: return data
    }

    return (Promise.reject(new Error(data.message || '请求失败')))
  }, (err) => {
    if (err.errMsg === 'request:fail abort') return Promise.reject(err)

    console.error(err)
    // toast.fail()
    return Promise.reject(err)
  })

export default request
