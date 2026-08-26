import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    exclude: ['**/node_modules/**', '**/.git/**', '**/._*', '.agents/**'],
  },
  resolve: {
    alias: {
      '#': path.resolve(__dirname, './src'),
    },
  },
})
