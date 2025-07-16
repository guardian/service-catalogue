import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./lib/__mocks__/mocks.ts', './vitest.setup.ts'],
    clearMocks: true,
    restoreMocks: true,
    reporters: process.env.GITHUB_ACTIONS 
      ? ['verbose', 'github-actions'] 
      : ['verbose'],
    update: false,
    allowOnly: false,
    passWithNoTests: false
  }
});