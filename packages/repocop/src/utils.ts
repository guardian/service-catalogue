import type { Repository } from './types';

export function isProduction(repo: Repository) {
	return repo.topics.includes('production') && !repo.archived;
}

//TODO test this
export class SetWithContentEquality<T> {
	private items: T[] = [];
	private getKey: (item: T) => string;

	constructor(getKey: (item: T) => string) {
		this.getKey = getKey;
	}

	add(item: T): void {
		const key = this.getKey(item);
		if (!this.items.some((existing) => this.getKey(existing) === key)) {
			this.items.push(item);
		}
	}

	has(item: T): boolean {
		return this.items.some(
			(existing) => this.getKey(existing) === this.getKey(item),
		);
	}

	values(): T[] {
		return [...this.items];
	}
}
