import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['dotenv/config', '../../vitest.setup.ts'],
    clearMocks: true,
     env: {
        npm_package_version: 'TEST',
        VERSION: 'TEST',
        NODE_ENV: 'test'
    },
    reporters: process.env.GITHUB_ACTIONS 
      ? ['verbose', 'github-actions'] 
      : ['verbose'],
  }
});