import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        manualChunks: undefined,
        // 优化输出文件名
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    // 优化生产环境构建
    sourcemap: false,
    // 使用esbuild替代terser（Vite默认的压缩工具）
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger']
    },
    // 设置构建输出目录
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@': './src'
    }
  },
  // 添加服务器配置以支持 SPA 路由
  server: {
    historyApiFallback: true,
    port: 3000
  },
  // 添加生产环境路由重写配置
  preview: {
    historyApiFallback: true
  }
})