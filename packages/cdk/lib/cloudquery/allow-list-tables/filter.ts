export function filterAllowedTables(
	tables: string[],
	tablesWithWildcards: RegExp[] | undefined,
): string[] {
	if (!Array.isArray(tablesWithWildcards)) {
		return [];
	}
	return tables.filter((table) =>
		tablesWithWildcards.some((regex) => regex.test(table)),
	);
}
