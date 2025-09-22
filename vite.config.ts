/*
 * @Author: paner 328538688@qq.com
 * @Date: 2025-09-21 14:44:06
 * @LastEditors: paner 328538688@qq.com
 * @LastEditTime: 2025-09-21 15:17:03
 * @FilePath: \MOO-music\vite.config.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { UnifiedViteWeappTailwindcssPlugin as uvwt } from 'weapp-tailwindcss-webpack-plugin/vite'
import postcss from './postcss.config'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import path from 'path'

const isH5 = process.env.UNI_PLATFORM === 'h5'
const app = process.env.UNI_PLATFORM === 'app'
const isProd = process.env.NODE_ENV === 'production'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    uni(),
    ...(isH5 || app ? [] : [uvwt()]),
    AutoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/ // .vue
      ],
      imports: [
        'vue',
        'pinia',
        'uni-app'
      ],
      dirs: [
        'src/store',
        'src/hooks/**'
      ],
      vueTemplate: true,
      dts: true, // or a custom path
      eslintrc: {
        enabled: true
      }
    }),
    Components({
      dts: true
    })
  ],
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'src')}/`
    }
  },
  css: {
    postcss
  },
  esbuild: {
    drop: isProd ? ['console', 'debugger'] : []
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://kele.160622.xyz:14000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true
      }
    }
  }
})
