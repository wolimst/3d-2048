import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => ({
  plugins: [sveltekit()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode)
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  },
  ssr: {
    noExternal: ['three']
  }
}))
