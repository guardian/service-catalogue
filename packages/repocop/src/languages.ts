export const ignoredLanguages = [
	'HTML',
	'CSS',
	'Shell',
	'Jupyter Notebook',
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
];

const commonSupportedLanguages = [
	'C#',
	'Go',
	'Java',
	'JavaScript',
	'Python',
	'Jinja', // Jinja uses Python dependencies
	'Mako', // Mako uses Python dependencies
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
