import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/main/tests/**/*.test.ts'],
    setupFiles: ['./src/main/tests/setup.ts']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/renderer/src')
    }
  }
})
