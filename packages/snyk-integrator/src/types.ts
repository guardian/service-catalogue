//GraphQL response types
interface PullRequestIdAndAuthor {
	author: {
		login: string;
	};
	id: string;
}

export interface PullRequestDetails {
	organization: {
		repository: {
			pullRequests: {
				nodes: [PullRequestIdAndAuthor];
			};
		};
	};
}

export interface ProjectId {
	organization: {
		projectV2: {
			id: string;
		};
	};
}
