import { getLastPrsQuery } from './projects-graphql';

/*
** We are testing the string interpolation as the query construction logic is
** quite fragile and needs to be exactly correct. It's also very unlikely to
** change in the near future, so these tests will not need to be updated often
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
});
