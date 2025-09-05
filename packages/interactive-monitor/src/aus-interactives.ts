export function isAusInteractive(repo: string): boolean {
	// This regex checks for the pattern oz-XXXX-* or oz-XXXXXX-* followed by a dash, where X is a digit.
	const ausInteractiveRegex = /^oz-(\d{4}|\d{6})-.+/;
	return ausInteractiveRegex.test(repo);
}
