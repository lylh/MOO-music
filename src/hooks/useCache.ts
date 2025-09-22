/**
 * @description 异步获取缓存数据
 * @param key 缓存key
 * @param fallback 初始值，获取到缓存后会更新初始值
 */
export default function useCache<
  T extends ReturnType<typeof ref> | ReturnType<typeof shallowRef> | ReturnType<typeof reactive> | ReturnType<typeof shallowReactive>
>(key: string, fallback: T) {
  uni.getStorage({
    key,
    success({ data }) {
      if (!data) return

      if (isRef(fallback)) {
        fallback.value = data
        return
      }

      if (isReactive(fallback)) {
        Array.isArray(data) && Array.isArray(fallback)
          ? data.forEach((v, i) => { fallback[i] = v })
          : Object.assign(fallback, data)
        return
      }
    },
    fail(err) {
      // 忽略存储不存在的错误，这是正常情况
      if (err.errMsg && err.errMsg.includes('storage 没有找到相同key的存储记录')) {
        // 静默处理，不输出错误日志
        return
      }
      console.error(err)
    },
    complete() {
      watch(fallback, (value) => {
        uni.setStorage({
          key,
          data: value,
          fail(err) { console.error(err) }
        })
      })
    }
  })

  return fallback
}
