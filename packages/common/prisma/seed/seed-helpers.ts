/**
 * Shared helper utilities for the local seed flow.
 */
import { randomUUID } from 'node:crypto';
import { cqSourceName } from './seed-constants.js';

/**
 * Creates standard CloudQuery-style metadata for seeded rows.
 */
export const createSeedMetadata = (cq_source_name: string = cqSourceName) => ({
	cq_sync_time: null,
	cq_source_name,
	cq_id: randomUUID(),
	cq_parent_id: null,
});

/**
 * Calls a createMany-style function only when there is data to persist.
 */
export async function createManyIfAny<T>(
	data: T[],
	create: (rows: T[]) => Promise<unknown>,
): Promise<void> {
	if (data.length > 0) {
		await create(data);
	}
}
