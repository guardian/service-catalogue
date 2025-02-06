export const ignoredLanguages = [
	'HTML',
	'CSS',
	'Shell',
	'Makefile',
	'Dockerfile',
	'PLpgSQL',
	'Thrift',
	'Batchfile',
	'HCL',
	'VCL',
	'SCSS',
	'Less',
	'Sass',
	'MDX',
	'Procfile',
	'Mermaid',
];

const commonSupportedLanguages = [
	'C#',
	'Go',
	'Java',
	'JavaScript',
	'EJS', // EJS uses JavaScript dependencies
	'Handlebars', // Handlebars uses JavaScript dependencies
	'Mustache', // Mustache uses JavaScript dependencies
	'Astro', // Astro uses JavaScript dependencies
	'Python',
	'Jinja', // Jinja uses Python dependencies
	'Mako', // Mako uses Python dependencies
	'Jupyter Notebook', // Jupyter Notebook uses Python dependencies
	'Ruby',
	'Rust',
	'Swift',
	'TypeScript',
	'CoffeeScript', // Uses JS/TS dependencies
	'Svelte', // Uses JS/TS dependencies
];

export const depGraphIntegratorSupportedLanguages = ['Scala', 'Kotlin'];

export const supportedDependabotLanguages = ignoredLanguages.concat(
	commonSupportedLanguages,
);
