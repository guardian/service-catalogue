import * as fs from 'node:fs';
import path from 'node:path';

type TableList = TableItem[];

type TableItem = {
	name: string;
	relations: TableItem[];
};

function parseFile(filepath: string): TableList {
	const contents = fs.readFileSync(filepath, 'utf8');
	try {
		return JSON.parse(contents) as TableList;
	} catch {
		throw new Error(`Failed to parse ${filepath} as JSON`);
	}
}

function getNames(tableItem: TableItem): string[] {
	return [tableItem.name, ...tableItem.relations.flatMap(getNames)];
}

function getTableNames(list: TableList): string[] {
	return list.flatMap(getNames);
}

if (require.main === module) {
	['aws', 'github', 'fastly', 'endoflife'].forEach((cqPluginName) => {
		const filepath = path.join(
			__dirname,
			`../cq-docs/${cqPluginName}/__tables.json`,
		);

		if (!fs.existsSync(filepath)) {
			throw new Error(`File ${filepath} does not exist.'`);
		}

		const content = parseFile(filepath);
		const tables = getTableNames(content);

		console.log(`${cqPluginName} has ${tables.length} tables`);
	});
}
