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
	'jq', // command-line JSON processor
	'XSLT', // transformations for XSL (styling language for XML)
	'TSQL', // Transact-SQL
	'PLSQL', // Procedural Language extensions to SQL
	'Rich Text Format',
	'ASL', // currently due to misattributed .dsl document files. TODO: revisit this in future
	'Cypher', // query language for neo4j
	'Awk', // interpreter, no dependencies
	'Apex', // only runs inside Salesforce which manages its dependencies
	'SaltStack', // OS-level dependencies
	'RenderScript', // Rust files are being misattributed to this due to .rs extension
	'ObjectScript', // Apex files are being misattributed to this due to the .cls extension
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
	'PHP', // Composer package manager supported
];

export const depGraphIntegratorSupportedLanguages = ['Scala', 'Kotlin'];

export const supportedDependabotLanguages = ignoredLanguages.concat(
	commonSupportedLanguages,
);
