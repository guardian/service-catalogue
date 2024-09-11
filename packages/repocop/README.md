# RepoCop

RepoCop is a tool to help us discover and apply best practices and obligations across our estate.
It is deployed as an AWS Lambda, and powers the [Dependency Vulnerability dashboard](https://metrics.gutools.co.uk/d/fdib3p8l85jwgd), as well as the [Best Practices Compliance dashboard](https://metrics.gutools.co.uk/d/EOPnljWIz)

See the [Grafana dashboard](https://metrics.gutools.co.uk/d/2uaV8PiIz/repocop?orgId=1) for a definition of the rules and how they are met.

## Running RepoCop locally

From the root of the repo:

1. Connect to the VPN
2. Retrieve Deploy Tools credentials
3. Run the setup script (only if running for the first time, or for the first time in a while)
4. Create a local [CloudQuery](../dev-environment/README.md) database by running `npm run start -w dev-environment`, and wait for the tables to be populated (this will take a few minutes)
5. Run repocop using `npm -w repocop start`

## How to write DB queries in RepoCop

There are lots of ways of writing/making queries to the database, depending on what you want to optimise for. To support a more functional code style, we have chosen to minimise the number of side-effecting DB calls, and pushed them as close to the edge of the lamda as possible (i.e. only making calls to the database at the very beginning, and at the very end of the lambda). This is slightly more memory intensive than making DB calls as and when we need them, but has a few advantages. These are:

- Fewer side effects make the code easier to reason about.
- Writing in a functional style is easier, so unit testing of business logic can be more comprehensive, requiring less mocking.
- If there are any issues connecting to the database, or even just a particular table, the lambda will fail quickly, wasting less time.

Our guidelines for DB calls in RepoCop are:

1. Only make one call to the database per table
2. Make all calls to the database at the beginning or end of the lambda
3. To reduce memory usage, when creating the query function, only select the columns you need. You can always come back later and select more if you need them.
4. When retrieving rows from the database, try not to do anything more complicated than a simple WHERE clause (for example, don't try to join two tables in one prisma query). Any complex logic should be handled by a unit-tested function.
