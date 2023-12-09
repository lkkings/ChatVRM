import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import svgLoader from 'vite-svg-loader'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), AutoImport({
    imports: ['vue','pinia']
  }),svgLoader()],
  server: {
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
