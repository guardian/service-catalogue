## Prisma

The .env file in the directory packages/repocop contains the DATABASE_URL needed for prisma `DATABASE_URL="postgresql://dbuser:dbpassword@hosturl:5432/postgres`

To run locally you can run `npm start` in the `repocop` directory.

## Database Migrations with Prisma Setup

We want to use prisma for our database migrations in order to profit from the audit
trail in the directory prisma migrations. And in the table _prisma_migration of the 
databases we use this process. This process is currently manual.

All migrations in the prisma/migration subdirectories have to be called migration.sql.
We need to apply the inial schema to our migration history
```
npx prisma migrate resolve --applied 0_init
```
The migration history is in the prisma/migration directory in the repository and the table _prisma_migrations in 
databases that use prisma to handle migrations.

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


