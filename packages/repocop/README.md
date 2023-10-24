# Repocop

Repocop is a tool to help us discover and apply best practices across our estate. See the [Grafana dashboard](https://metrics.gutools.co.uk/d/2uaV8PiIz/repocop?orgId=1) for a definition of the rules and how they are met.

Repocop uses the [Prisma](https://www.prisma.io) ORM for database migrations in order to profit from the audit
trail it provides.

## Database migrations with Prisma

The migration process is currently manual.

Migration history is held in the `prisma/migrations` directory in the repository and the `_prisma_migrations` table in the
database.

All migrations in the `prisma/migrations` subdirectories must be named `migration.sql`.

Prisma will look for the `DATABASE_URL` environment variable in order to carry out migration.

The `DATABASE_URL` is set automatically by the NPM migration scripts for each stage (see below).

> [!NOTE]  
> At the moment it is not possible to have more than
> one `schema.prisma` file.

## Adding new tables locally

To add a new table to the database you need to add a new model to the `schema.prisma` file. To apply the migration locally:

1. [Start Cloudquery](../../packages/cloudquery/README.md) to generate the database.
2. Apply the migration by running:

```
npm -w repocop run migrate:dev [migration-name]
```

> [!NOTE]  
> This will apply all migrations including any new ones, and replace the `_prisma_migrations` table and any existing tables and data locally.

See [Prisma documentation on creating migrations](https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate#create-migrations).

If you want to use your new table(s) in Typescript code you need to regenerate the Prisma client by running:

```
npx prisma generate
```

## Deploying new tables (migrating) to code or prod

1. Create the migration (see above) and make sure it works locally.
2. Raise a PR and ensure to note that migration has to be deployed manually after the PR is merged.
3. Get deployTools credentials from Janus.
4. Connect to the VPN.
5. To deploy the migration to code, run:

```
npm -w repocop run migrate:code
```

or to prod, run:

```
npm -w repocop run migrate:prod
```

If you encounter errors, it might be because the table existed already in the database (used by another app). See [how to fix](https://www.prisma.io/docs/guides/migrate/production-troubleshooting#failed-migration).

See [Prisma documentation on migration](https://www.prisma.io/docs/concepts/components/prisma-migrate/migrate-development-production).

## Running Repocop locally

In order for Repocop to run locally, Cloudquery must be running locally and have populated tables for Repocop to query. It can take some time for the Cloudquery tables to populate.

### Running Repocop for the first time

1. [Start Cloudquery](../../packages/cloudquery/README.md) to generate the database.
2. Set up Repocop: run `npm -w repocop run migrate:setuplocal` to create the `_prisma_migrations` table in the database.
3. Wait for at least 15 minutes for the Cloudquery tables to start filling up.
4. Start Repocop: run `npm -w repocop start`.

### Running Repocop if you have Cloudquery running and a populated database

1. (Optional) Setup Repocop: Run `npm -w repocop run migrate:setuplocal` to create the `_prisma_migrations` table in the database. Note: This will replace any existing Repocop tables and data locally.
2. Start Repocop: Run `npm -w repocop start`.
