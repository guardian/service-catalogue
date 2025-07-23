/**
 * This script generates the best-practices.md file from the definitions in the definitions.ts file.
 *
 * Add new best practices to the definitions.ts file.
 */
import * as fs from 'fs';
import { markdownTable } from 'markdown-table';
import { AllBestPractices } from './definitions.js';

const markdownFilepath = './best-practices.md';

const file = fs.readFileSync(markdownFilepath, 'utf-8');

const startMark = '<!-- contentstart -->';
const endMark = '<!-- contentend -->';

if (!file.includes(startMark) || !file.includes(endMark)) {
	throw new Error(
		`Could not find start (${startMark}) and end markers (${endMark}) in ${markdownFilepath}`,
	);
}

const tableHeaderRow = [
	'Name',
	'Owner',
	'Description',
	'How to check compliance',
	'How to exempt',
	'Remediation',
	'ID', // This will be auto-generated
];

const markdownContent = Object.entries(AllBestPractices).flatMap(
	([section, bestPractices]) => {
		const markdownH2 = `## ${section}`;

		const tableRows = bestPractices.map((row, index) => {
			const id = [section, (index + 1).toString().padStart(2, '0')]
				.join('-')
				.toUpperCase();

			// eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-assignment -- testing
			return [...Object.values(row), id];
		});

		const table = markdownTable([tableHeaderRow, ...tableRows]);

		return [markdownH2, table];
	},
);

// Find the markers, and replace them, and any text in between, with the new content.
const re = new RegExp(`${startMark}(.|\n)*${endMark}`, 'm');
const updatedFile = file.replace(
	re,
	[startMark, ...markdownContent, endMark].join('\n'),
);
fs.writeFileSync(markdownFilepath, updatedFile, 'utf-8');
