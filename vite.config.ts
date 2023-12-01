import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import svgLoader from 'vite-svg-loader'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), AutoImport({
    imports: ['vue']
  }),svgLoader()],
  envPrefix:'APP_',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), //配置@路径
    }
  }
})
