/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  corePlugins: {
    preflight: false
  },
  theme: {
    extend: {
      colors: {
        black: {
          1: '#0a0a0a',  // 稍微亮一点的黑色
          2: '#1e1e1e',  // 更亮的深灰色，提高对比度
          3: '#2a2a2a'   // 卡片背景色
        },
        yellow: {
          1: '#fce939',
          2: '#f5d916'   // 更深的黄色用于悬停
        },
        white: {
          1: '#ffffff',  // 纯白色，提高对比度
          2: '#f5f5f5'   // 浅灰白色
        },
        grey: {
          1: '#b8b8b8',  // 更亮的灰色，提高可读性
          2: '#888888',  // 中等灰色
          3: '#404040'   // 深灰色用于边框
        },
        red: {
          1: '#fd3148'
        },
        primary: '#fce939'  // 主色调
      }
    }
  },
  plugins: []
}

