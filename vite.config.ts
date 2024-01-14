import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import svgLoader from 'vite-svg-loader'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), AutoImport({
    imports: ['vue','pinia']
  }),svgLoader()],
  server: {
    open: true,
    https: {
      // 主要是下面两行的配置文件，不要忘记引入 fs 和 path 两个对象
      cert: fs.readFileSync(path.join(__dirname, 'src/ssl/cert.crt')),
      key: fs.readFileSync(path.join(__dirname, 'src/ssl/cert.key'))
    },
    cors: true,
    proxy: {
      // 将需要跨域请求的路径映射到目标地址
      '/api': {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        //rewrite: (path) => path.replace(/\/api/, "/api"), 
        // 设置额外的请求头部信息
      }
    }
  },
  envPrefix:'APP_',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), //配置@路径
    }
  }
})
