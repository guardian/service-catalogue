export function daysDifference(date1: Date, date2: Date): number {
	const diff = date1.getTime() - date2.getTime();
	const millisInADay = 1000 * 60 * 60 * 24;
	return Math.round(diff / millisInADay);
}
