import { h1, h2, h3, italic, table, tsMarkdown } from 'ts-markdown';
import type { Result } from './types';

function getHeader() {
	return [
		italic(
			`This file was generated with \`npm -w cloudquery-tables run diff\``,
		),
		h1('CloudQuery Table Report'),
	];
}

function getSummary(result: Result[]) {
	return [
		h2('Summary'),
		table({
			columns: ['Plugin', 'Removed', 'Collected', 'Available'],
			rows: result.map((item) => [
				item.name,
				item.tablesRemoved.length,
				item.tablesCollected.length,
				item.tablesAvailable.length,
			]),
		}),
	];
}

function getBody(result: Result[]) {
	const markdownList = (list: string[]) => {
		return list.length === 0
			? '- None 🎉'
			: list.map((t) => `- ${t}`).join('\n');
	};

	const tableList = (list: string[], title: string, description: string) => {
		return [
			h3(`Tables ${title} (${list.length})`),
			italic(description),
			markdownList(list),
		];
	};

	return result.flatMap((item) => {
		const { name, version, tablesCollected, tablesRemoved, tablesAvailable } =
			item;
		return [
			h2(`${name} v${version}`),

			tableList(
				tablesRemoved,
				'removed',
				'Tables that were being collected but no longer exist in the CloudQuery plugin.',
			),

			tableList(
				tablesCollected,
				'collected',
				'Tables that will continue to be collected.',
			),

			tableList(tablesAvailable, 'available', 'Tables that can be collected.'),
		].flat();
	});
}

export function createReport(result: Result[]) {
	return tsMarkdown([getHeader(), getSummary(result), getBody(result)].flat());
}
