import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    reporters: process.env.GITHUB_ACTIONS 
      ? ['verbose', 'github-actions'] 
      : ['verbose'],
  }
});