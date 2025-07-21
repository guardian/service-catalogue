import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['dotenv/config', '../../vitest.setup.ts'],
    clearMocks: true,
    reporters: process.env.GITHUB_ACTIONS 
      ? ['verbose', 'github-actions'] 
      : ['verbose'],
  }
});