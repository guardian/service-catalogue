# Repocop

## Database Migrations with Prisma Setup

We want to use prisma for our database migrations in order to profit from the audit
trail in the directory prisma migrations. And in the table _prisma_migration of the 
databases we use this process. This process is currently manual.

Prisma will look for the `DATABASE_URL` needed for migration in `.env` file in the directory `packages/repocop`.  It takes the form: ```DATABASE_URL="postgresql://dbuser:dbpassword@hosturl:5432/postgres```

All migrations in the prisma/migration subdirectories have to be called migration.sql.
We need to apply the initial schema to our migration history
```
npx prisma migrate resolve --applied 0_init
```
The prisma commands need to be run in the repocop directory.
The migration history is in the prisma/migration directory in the repository and the table _prisma_migrations in 
databases that use prisma to handle migrations.

If you want to use your new table in typescript code you need to regenerate the prisma client
```
npx prisma generate
```

## Adding new tables in dev

To add a new table on the db you need to a new model to the schema.prisma and apply to migration by running
in the `repocop` directory
```
npx prisma migrate dev --name migration-name
```
See [Prisma Documentation](https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate#create-migrations)
Create the migration and make sure it works locally
Raise a PR and mention it has to be applied to production manually at the moment

## Deploy database migration

To deploy a new database migration run
```
npx prisma migrate deploy
```
See [Prisma Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate/migrate-development-production)

At the moment it is not possible to have more than 
one scheme.prisma file.

## Running Repocop locally

1. [Start Cloudquery](../../packages/cloudquery/README.md) to generate the database
2. Put `DATABASE_URL="postgresql://postgres:not_at_all_secret@localhost:5432/postgres"` in a `.env` file in `packages/repocop`
3. Apply the initial schema: `npx -w repocop prisma migrate resolve --applied 0_init`
4. Run a migration: `npx -w repocop prisma migrate deploy`
5. Start Repocop: `npm start -w repocop`