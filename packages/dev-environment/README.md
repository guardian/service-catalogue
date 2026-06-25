> **Warning**
> This is for local development only, and deliberately removes authentication for ease.

# CloudQuery

A small project for running [CloudQuery](https://www.cloudquery.io/) locally, using Docker.

It includes:

- CloudQuery
- Postgres
- Grafana

## Requirements

- Docker

## Setup

We recommend using the repository dev container (via guardian/devenv) to run and develop locally more securely, although running directly on your machine is still supported.

1. Get deployTools credentials from Janus. Service Catalogue read-only is appropriate
2. In the project root, run the following, and follow the resulting instructions:

```sh
./scripts/setup.sh
```

## Running

1. Start Docker
2. Run the following in the project root:

   ```sh
   npm start -w dev-environment
   ```

   OR:

   ```sh
   ./packages/dev-environment/script/start
   ```

3. This will:
   - start the local Postgres container
   - run Prisma migrations
   - generate the Prisma client
   - seed the database with local development data using Prisma
   - start CloudQuery to collect additional data
   - start Grafana

   Unlike the previous setup, this does **not** copy data from another database.

4. Wait for tables to start being populated. Seeded data should be available once the Prisma seed step completes, and CloudQuery-populated tables usually start appearing after a few seconds, though it can sometimes take up to a minute.
5. Open Grafana on [http://localhost:3000](http://localhost:3000), and start querying the data.
6. To restart on your local machine, delete the containers and volumes and start again from step 2.

> **Note**
> You can also use other Postgres clients, such as `psql`, to query the data, or even your IDE using the local development credentials from the [.env](../../.env) file.

## Seed data

The local development database is initialised with Prisma seed data from `packages/common/prisma/seed.ts`.

The seeded database provides a predictable local starting point for development and testing. (It is not a snapshot or copy of any remote database.)

It provides seed data, or at least empty tables, to allow all packages in this repo that currently use the database to run successfully locally.

If you need to re-run the seed from a clean state, remove the local containers and volumes and then run `npm start -w dev-environment` again.

### Adding tables to the seed

If you want to test new functionality, you can seed additional tables by updating `packages/common/prisma/seed.ts` with the relevant Prisma calls.

When adding seed data:

- add records for the new Prisma model in `seed.ts`
- keep the seed data small and deterministic so local runs stay predictable
- insert parent records before child records where foreign key relationships exist
- avoid using production or copied remote data in the local seed

After updating the seed, remove the local containers and volumes and then run:

```sh
npm start -w dev-environment
```

## Testing the Prisma migration container

To test the Prisma migration container you can run the following script:

```sh
./packages/dev-environment/script/start-prisma-migrate-test
```

This will run the `run-prisma-migrate.sh` script.

## Repocop

To develop locally once the tables have been populated, follow the steps in the Repocop [README](../repocop/README.md).

## Links

- [CloudQuery provided Grafana dashboards](https://github.com/cloudquery/cloudquery/tree/main/plugins/source/aws/dashboards)

## Tips and tricks

The local instance of CloudQuery executes sequentially according to the order of the plugins in the config file.

If CloudQuery can't detect credentials for GitHub, it will skip those jobs. If you're not interested in GitHub
data, you don't need to generate a token. It will still collect data from other sources.

## TODO

- Use the same configuration files as PROD?
