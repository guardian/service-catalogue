import type {
	RepositoriesResponse,
	RepositoryResponse,
} from 'common/github/github';
import type { Repository } from 'common/model/github';

function timestampsMatch(
	oldRepo: Repository,
	newRepo: RepositoryResponse,
): boolean {
	if (
		newRepo.updated_at &&
		newRepo.pushed_at &&
		oldRepo.updated_at &&
		oldRepo.pushed_at
	) {
		const newUpdate: number = new Date(newRepo.updated_at).getTime();
		const oldUpdate: number = new Date(oldRepo.updated_at).getTime();
		const newPush: number = new Date(newRepo.pushed_at).getTime();
		const oldPush: number = new Date(oldRepo.pushed_at).getTime();
		const matchingUpdateTime = newUpdate == oldUpdate;
		const matchingPushTime = newPush == oldPush;
		return matchingPushTime && matchingUpdateTime;
	} else {
		return false;
	}
}

export function foundUnchangedMatchOnGithub(
	oldRepo: Repository,
	newRepos: RepositoriesResponse,
): boolean {
	const matchingRepo: RepositoryResponse | undefined = newRepos.find(
		(newRepo) => newRepo.name === oldRepo.name,
	);
	if (matchingRepo) {
		return timestampsMatch(oldRepo, matchingRepo);
	} else {
		return false;
	}
}
