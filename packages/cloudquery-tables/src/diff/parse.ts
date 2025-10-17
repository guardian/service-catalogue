import * as fs from 'node:fs';
import type { CloudQueryTable } from './types';

type CloudQueryTableList = CloudQueryTableItem[];

type CloudQueryTableItem = {
	name: string;
	relations: CloudQueryTableItem[];
	is_incremental?: boolean;
};

function extractTablesFromItem(
	tableItem: CloudQueryTableItem,
): CloudQueryTable[] {
	return [
		{
			name: tableItem.name,
			isIncremental: tableItem.is_incremental ?? false,
		},
		...tableItem.relations.flatMap(extractTablesFromItem),
	].flat();
}

function extractTables(list: CloudQueryTableList): CloudQueryTable[] {
	return list.flatMap(extractTablesFromItem);
}

/**
 * Reads the JSON file created by the CloudQuery CLI (`cloudquery tables`)
 * and returns a list of all the table names.
 *
 * @param filepath the path to the JSON file the CLI created
 */
export function getTables(filepath: string): CloudQueryTable[] {
	if (!fs.existsSync(filepath)) {
		throw new Error(`File ${filepath} does not exist`);
	}

	const content = fs.readFileSync(filepath, 'utf8');

	try {
		const jsonContent = JSON.parse(content) as CloudQueryTableList;
		return extractTables(jsonContent);
	} catch {
		throw new Error(`Failed to parse ${filepath} as JSON`);
	}
}
