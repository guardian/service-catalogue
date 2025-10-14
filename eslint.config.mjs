import guardian from '@guardian/eslint-config';
import prettier from 'eslint-plugin-prettier';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

export default [
	...guardian.configs.recommended,
	...guardian.configs.jest,
	{
		plugins: {
			prettier,
			unicorn: eslintPluginUnicorn,
		},
		rules: {
			'prettier/prettier': 'error',
			'unicorn/prefer-array-flat-map': 'error',
		},
		ignores: ['**/*/dist/**', '**/generated/prisma/'],
	},
];
