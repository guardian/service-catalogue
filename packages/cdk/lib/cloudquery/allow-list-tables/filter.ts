export function filterAllowedTables(
	tables: string[],
	tablesWithWildcards: string[] | undefined,
): string[] {
	if (!Array.isArray(tablesWithWildcards)) {
		return [];
	}
	const patternList = Array.isArray(tablesWithWildcards)
		? tablesWithWildcards
		: [tablesWithWildcards];
	const regexList = patternList.map(
		(pattern) => new RegExp('^' + pattern.replace(/\*/g, '.*') + '$'),
	);
	return tables.filter((table) => regexList.some((regex) => regex.test(table)));
}
