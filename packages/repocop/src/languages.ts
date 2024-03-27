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
const snykOnlySupportedLanguages = [
	'C',
	'C++',
	'Apex',
	'Bazel',
	'Elixir',
	'Kotlin',
	'PHP',
	'Scala',
	'Objective-C',
	'Visual Basic .NET',
];

export const actionSupportedLanguages = ignoredLanguages.concat(
	'Scala',
	'TypeScript',
	'Go',
	'Python',
	'JavaScript',
	'Swift',
	'Kotlin',
	'Ruby',
);

export const supportedDependabotLanguages = ignoredLanguages.concat(
	commonSupportedLanguages,
);

export const supportedSnykLanguages = ignoredLanguages
	.concat(commonSupportedLanguages)
	.concat(snykOnlySupportedLanguages);
