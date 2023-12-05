// vite.config.ts
import { defineConfig } from "file:///home/lkkings/ChatVRM/node_modules/.pnpm/vite@5.0.3_@types+node@20.10.3/node_modules/vite/dist/node/index.js";
import vue from "file:///home/lkkings/ChatVRM/node_modules/.pnpm/@vitejs+plugin-vue@4.5.0_vite@5.0.3_vue@3.3.9/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import AutoImport from "file:///home/lkkings/ChatVRM/node_modules/.pnpm/unplugin-auto-import@0.17.1/node_modules/unplugin-auto-import/dist/vite.js";
import svgLoader from "file:///home/lkkings/ChatVRM/node_modules/.pnpm/vite-svg-loader@5.1.0_vue@3.3.9/node_modules/vite-svg-loader/index.js";
import path from "path";
var __vite_injected_original_dirname = "/home/lkkings/ChatVRM";
var vite_config_default = defineConfig({
  plugins: [vue(), AutoImport({
    imports: ["vue", "pinia"]
  }), svgLoader()],
  envPrefix: "APP_",
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "src")
      //配置@路径
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9sa2tpbmdzL0NoYXRWUk1cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2xra2luZ3MvQ2hhdFZSTS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9sa2tpbmdzL0NoYXRWUk0vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJ1xuaW1wb3J0IHN2Z0xvYWRlciBmcm9tICd2aXRlLXN2Zy1sb2FkZXInXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3Z1ZSgpLCBBdXRvSW1wb3J0KHtcbiAgICBpbXBvcnRzOiBbJ3Z1ZScsJ3BpbmlhJ11cbiAgfSksc3ZnTG9hZGVyKCldLFxuICBlbnZQcmVmaXg6J0FQUF8nLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLCAvL1x1OTE0RFx1N0Y2RUBcdThERUZcdTVGODRcbiAgICB9XG4gIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlQLFNBQVMsb0JBQW9CO0FBQzlRLE9BQU8sU0FBUztBQUNoQixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGVBQWU7QUFDdEIsT0FBTyxVQUFVO0FBSmpCLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxJQUFJLEdBQUcsV0FBVztBQUFBLElBQzFCLFNBQVMsQ0FBQyxPQUFNLE9BQU87QUFBQSxFQUN6QixDQUFDLEdBQUUsVUFBVSxDQUFDO0FBQUEsRUFDZCxXQUFVO0FBQUEsRUFDVixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUE7QUFBQSxJQUNwQztBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
