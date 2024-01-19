/**
 * A helper function to make user data strings easier to write.
 *
 * Example usage:
 * ```typescript
 * const message = stripMargin`
 *   |Hello
 *   |From
 *   |The Guardian`;
 * ```
 *
 * @param template a template string
 * @param args extra arguments
 */
export function stripMargin(
	template: TemplateStringsArray,
	...args: unknown[]
): string {
	const result = template.reduce((acc, part, i) =>
		[acc, args[i - 1], part].join(''),
	);
	return result.replace(/\r?(\n)\s*\|/g, '$1').trim();
}
