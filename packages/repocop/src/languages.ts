export const ignoredLanguages = [
	'HTML',
	'CSS',
	'Shell',
	'Jupyter Notebook',
	'Makefile',
	'Dockerfile',
	'PLpgSQL',
	'Thrift',
	'SCSS',
	'Batchfile',
	'HCL',
	'VCL',
];

const commonSupportedLanguages = [
	'C#',
	'Go',
	'Java',
	'JavaScript',
	'Python',
	'Swift',
	'TypeScript',
];
const snykOnlySupportedLanguages = [
	'C',
	'C++',
	'Apex',
	'Bazel',
	'Elixir',
	'Kotlin',
	'PHP',
	'Ruby',
	'Rust',
	'Scala',
	'Objective-C',
	'Visual Basic .NET',
];

export const supportedDependabotLanguages = ignoredLanguages.concat(
	commonSupportedLanguages,
);

export const supportedSnykLanguages = ignoredLanguages
	.concat(commonSupportedLanguages)
	.concat(snykOnlySupportedLanguages);
