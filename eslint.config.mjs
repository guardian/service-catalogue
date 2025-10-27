import guardian from '@guardian/eslint-config';
import prettier from 'eslint-plugin-prettier';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

export default [
	...guardian.configs.recommended,
	...guardian.configs.jest,
	{
		ignores: ['**/*/dist/**', '**/generated/prisma/'],
	},
	{
		plugins: {
			prettier,
			unicorn: eslintPluginUnicorn,
		},
		rules: {
			'prettier/prettier': 'error',
			'unicorn/prefer-array-flat-map': 'error',
		},
	},
];
