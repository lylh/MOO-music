import type { Playlist } from '@/api/interface/Playlist'
import type { Song } from '@/components/Song/Song.vue'
import type { SongURL } from '@/api/interface/SongURL'
import { getSongURL } from '@/api/play'
import toast from '@/utils/toast'
import { shuffle, transHTTPS } from '@/utils/util'
import { getSimiSongs } from '@/api/play'
import useCache from '@/hooks/useCache'

export interface SongInfo {
  song: Song
  urlInfo: SongURL
}

export const useAudioStore = defineStore('audio', () => {
  const userStore = useUserStore()
  //* 播放模式: loop => 循环播放, random => 随机播放
  const playMode: ('loop' | 'random')[] = ['loop', 'random']
  
  // 音质设置
  const audioQuality = useCache('audioQuality', ref<'standard' | 'higher' | 'exhigh' | 'lossless' | 'hires' | 'jyeffect' | 'sky' | 'jymaster'>('standard'))

  const audio = markRaw(uni.getBackgroundAudioManager?.() || uni.createInnerAudioContext())
  const isLoading = ref(false) // * 是否缓冲中
  const isPlay = ref(false) // * 是否播放
  const isSeeked = ref(false) // * 是否拖动进度条
  const duration = ref(0) // * 当前歌曲时长
  const currentTime = ref(0) // * 当前歌曲播放时间
  const mode = useCache('mode', ref<typeof playMode[0]>('loop')) // * 播放模式（默认循环播放）

  const playlist = useCache('playlist', shallowRef<Playlist>())
  const songs = useCache('songs', shallowRef<Song[]>([]))
  const currentSongInfo = shallowRef<SongInfo>()
  const currentSongIndex = ref(-1)
  const associationSong = shallowRef<Song>() // * 联想歌曲

  function setPreSong() {
    if (!songs.value.length) return

    const last = songs.value.length - 1
    const currentIndex = currentSongIndex.value
    const preIndex = currentIndex === 0 ? last : currentIndex - 1
    setCurrentSong(songs.value[preIndex], preIndex)
  }

  function setNextSong() {
    if (!songs.value.length) return

    const last = songs.value.length - 1
    const currentIndex = currentSongIndex.value
    const nextIndex = currentIndex === last ? 0 : currentIndex + 1

    if (!associationSong.value || currentIndex !== last) {
      setCurrentSong(songs.value[nextIndex], nextIndex)
      return
    }

    //* 如果处于联想歌曲状态，就继续获取
    getSimiSongs(songs.value[currentIndex].id).then((_songs) => {
      associationSong.value = songs.value[currentIndex]
      songs.value = _songs
      setCurrentSong(songs.value[nextIndex], nextIndex)
    })
  }

  async function setCurrentSong(song: Song, index: number) {
    audio.pause()
    currentSongIndex.value = index

    // * 重复点击，重新播放
    if (currentSongInfo.value?.song.id === song.id && currentSongInfo.value.urlInfo.url) {
      return (audio.seek(0), audio.play())
    }

    try {
      isLoading.value = true
      // 使用用户设置的音质，不再强制要求登录状态
      const quality = audioQuality.value
      const { data: [urlInfo] } = await getSongURL(song.id, quality)
      console.log('🚀 ~ file: audio.ts:58 ~ setCurrentSong ~ urlInfo:', urlInfo)

      const oldSongInfo = currentSongInfo.value
      const newSongInfo = currentSongInfo.value = { song, urlInfo }
      // * 有 url 正常播放
      if (newSongInfo.urlInfo.url) return setBackgroundAudio(currentSongInfo.value)

      // * url为空自动下一首
      if (!oldSongInfo || oldSongInfo.urlInfo.url) return setNextSong()

      // ! 连续两次请求 url 都为空直接报错退出（避免无限循环下一首）
      userStore.profile ? toast.fail('播放地址失效,请尝试重新登录') : toast.fail('播放地址失效')
      throw new Error('播放地址失效')
    } catch (error) {
      audio.pause()
      console.error(error)
      isLoading.value = false
      isPlay.value = false
    }
  }

  //* 模式播放
  async function onPlay(index: number, _songs: Song[], _playlist?: Playlist, isAssociate?: boolean) {
    if (playlist.value !== _playlist) playlist.value = _playlist
    //* 退出歌曲联想
    if (!isAssociate && associationSong.value) associationSong.value = undefined

    switch (mode.value) {
      case 'random': {
        originSongs = _songs
        songs.value = shuffle(originSongs.slice())
        const id = _songs[index].id
        await setCurrentSong(_songs[index], songs.value.findIndex(v => v.id === id))
        break
      }
      case 'loop': {
        if (songs.value !== _songs) songs.value = _songs
        await setCurrentSong(_songs[index], index)
        break
      }
    }
  }

  let originSongs: Song[] = [] // ! 用于切换模式时保留的原"songs"引用
  function setPlayMode() {
    // * 如果因为缓存导致顺序不对，就继续翻转
    if (playMode[0] !== mode.value) {
      playMode.unshift(playMode.pop()!)
      return setPlayMode()
    }

    // * 切换模式
    playMode.unshift(mode.value = playMode.pop()!)

    if (!songs.value.length) return

    switch (mode.value) {
      case 'loop': {
        songs.value = originSongs
        originSongs = []
        break
      }
      case 'random': {
        originSongs = songs.value
        songs.value = shuffle(originSongs.slice())
        break
      }
    }

    const id = currentSongInfo.value?.song.id
    currentSongIndex.value = songs.value.findIndex(v => v.id === id)
  }

  function setBackgroundAudio({ song, urlInfo }: SongInfo) {
    audio.title = song.name
    audio.epname = song.al.name
    audio.singer = song.ar.reduce((acc, { name }) => (acc += name + '. '), '')
    audio.coverImgUrl = song.al.picUrl + '?param=500y500'
    audio.src = transHTTPS(urlInfo.url)

    // #ifdef H5
    // * 设置浏览器的音乐播放器信息   p.s: 就是插件栏右边的那个音乐按钮
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.name,
      artist: song.al.name,
      album: audio.epname,
      artwork: [{ src: song.al.picUrl + '?param=500y500', sizes: '500x500', type: 'image/png' }]
    })
    // #endif
  }

  function toggle() {
    if (currentSongInfo.value?.urlInfo.url) {
      isPlay.value ? audio.pause() : audio.play()
    }
  }

  return {
    audio,
    isLoading,
    isPlay,
    isSeeked,
    duration,
    currentTime,
    mode,
    audioQuality,
    playlist,
    songs,
    associationSong,
    currentSongInfo,
    currentSongIndex,
    setPreSong,
    setCurrentSong,
    setNextSong,
    setPlayMode,
    onPlay,
    toggle
  }
})

export function setupAudio() {
  const audioStore = useAudioStore()
  const { audio } = audioStore
  // @ts-ignore
  audio.autoplay = true

  audio.onCanplay(() => {
    audioStore.isLoading = false
    audioStore.duration = audioStore.currentSongInfo?.urlInfo.time! / 1000
    audio.play()
    console.log('onCanplay.duration: ', audioStore.duration)
  })

  audio.onPlay(() => {
    console.log('onPlay: ')
    audioStore.isPlay = true
  })

  audio.onPause(() => {
    console.log('onPause: ')
    audioStore.isPlay = false
  })

  audio.onEnded(() => {
    console.log('onEnded: ')
    audioStore.setNextSong()
  })

  audio.onTimeUpdate(() => {
    audioStore.currentTime = audio.currentTime
  })

  audio.onError((err) => {
    console.error('❌ Audio error:', err)
    // 显示Promise异常提示
    if (typeof uni !== 'undefined') {
      uni.showToast({
        title: '❌ 音频异常',
        icon: 'none',
        duration: 3000
      })
    }
    toast.fail('链接无效')

    audioStore.isLoading = false
    audioStore.isPlay = false
  })

  // #ifndef H5
  audio.onNext(() => {
    console.log('onNext: ')
    audioStore.setNextSong()
  })

  audio.onPrev(() => {
    console.log('onPrev: ')
    audioStore.setPreSong()
  })
  // #endif

  // #ifdef H5
  // * 监听浏览器的音乐播放器操作   p.s: 就是插件栏右边的那个音乐按钮
  navigator.mediaSession.setActionHandler('previoustrack', audioStore.setNextSong)
  navigator.mediaSession.setActionHandler('nexttrack', audioStore.setNextSong)
  // #endif
}
