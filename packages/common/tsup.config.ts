import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm'],
	outDir: 'dist',
	target: 'es2022',
	clean: true,
	sourcemap: false,
	dts: false,
});
