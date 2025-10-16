import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isLibrary = mode === 'production'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@legacy': path.resolve(__dirname, 'src/react-legacy/src'),
      },
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    optimizeDeps: {
      include: [
        'socket.io-client', 
        'mediasoup-client', 
        '@mediapipe/selfie_segmentation',
        '@fortawesome/react-fontawesome',
        'react',
        'react-dom',
        'universal-cookie',
        'bootstrap'
      ]
    },
    build: isLibrary ? {
      // Library build configuration for npm package
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        name: 'MediaSFUVue',
        formats: ['es', 'cjs'],
        fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
      },
      rollupOptions: {
        // Externalize dependencies that shouldn't be bundled
        external: [
          'vue',
          'react',
          'react-dom',
          'socket.io-client',
          'universal-cookie',
          'mediasfu-shared',
          /^@fortawesome/,
          /^@mediapipe/,
          /^mediasoup-client/,
          /^bootstrap/
        ],
        output: {
          globals: {
            vue: 'Vue'
          },
          preserveModules: false,
          exports: 'named',
          assetFileNames: 'mediasfu-vue.[ext]'
        },
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
          if (warning.code === 'UNRESOLVED_IMPORT') return
          warn(warning)
        }
      },
      outDir: 'dist',
      sourcemap: true,
      minify: false,
      emptyOutDir: true
    } : {
      // Dev build configuration
      outDir: 'dist-dev',
      sourcemap: true
    }
  }
})
