import * as fs from 'node:fs';

type CloudQueryTableList = CloudQueryTableItem[];

type CloudQueryTableItem = {
	name: string;
	relations: CloudQueryTableItem[];
};

function extractTableNamesFromItem(tableItem: CloudQueryTableItem): string[] {
	return [
		tableItem.name,
		...tableItem.relations.flatMap(extractTableNamesFromItem),
	];
}

function extractTableNames(list: CloudQueryTableList): string[] {
	return list.flatMap(extractTableNamesFromItem);
}

/**
 * Reads the JSON file created by the CloudQuery CLI (`cloudquery tables`)
 * and returns a list of all the table names.
 *
 * @param filepath the path to the JSON file the CLI created
 */
export function getTableNames(filepath: string): string[] {
	if (!fs.existsSync(filepath)) {
		throw new Error(`File ${filepath} does not exist`);
	}

	const content = fs.readFileSync(filepath, 'utf8');

	try {
		const jsonContent = JSON.parse(content) as CloudQueryTableList;
		return extractTableNames(jsonContent);
	} catch {
		throw new Error(`Failed to parse ${filepath} as JSON`);
	}
}
