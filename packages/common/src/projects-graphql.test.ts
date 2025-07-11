import { describe, expect, it } from 'vitest';
import { addToProjectQuery, getLastPrsQuery } from './projects-graphql';

/*
 ** We are testing the string interpolation as the query construction logic is
 ** quite fragile and a stray bracket can cause a failure.
 **
 ** The structure of the queries is very stable, and will not change very
 ** often, so these tests will not need to be frequently updated, and are
 ** mostly here as a typo safeguard for future travellers.
 */

describe('Formatting graphQL queries', () => {
	it('should return a valid graphQL object when constructing the query for getting the most recent PRs', () => {
		const actual = getLastPrsQuery('test-repo');
		const expected = String.raw`{
        organization(login: "guardian") {
          repository(name: "test-repo") {
            pullRequests(last: 5, states:[OPEN]) {
              nodes {
                author {
                  login
                }
                id
              }
            }
          }
        }
      }`;

		expect(actual).toEqual(expected);
	});
	it('should return a valid graphQL object when constructing the query for adding a PR to a project', () => {
		const actual = addToProjectQuery('test-project-id', 'test-pr-id')
			.replaceAll('\t', '') //getting the spacing right in this query is a pain, and unimportant, so remove it
			.replaceAll('\n', '');
		const expected = String.raw`mutation {addProjectV2ItemById(input: {projectId: "test-project-id" contentId: "test-pr-id"}) {  item {id  }}  }`;
		expect(actual).toEqual(expected);
	});
});
