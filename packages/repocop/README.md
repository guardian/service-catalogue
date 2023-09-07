## Prisma

The .env file contains the DATABASE_URL needed for prisma `DATABASE_URL="postgresql://dbuser:dbpassword@hosturl:5432/postgres`

To run locally you can run `npm start` in the `repocop` directory.

## Database Migrations with Prisma Setup

We want to use prisma for our database migrations in order to profit from the audit
trail in the directory prisma migrations. And in the table _prisma_migration of the 
databases we use this process. This process is currently manual.

In order to do so we need an initial schema.prisma file we can create using our existing db with
```
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
```
All migrations in the prisma/migration subdirectories have to be called migration.sql.
We need to apply the inial schema to our migration history
```
npx prisma migrate resolve --applied 0_init
```
The migration history is in the prisma/migration directory in the repository and the table _prisma_migrations in 
databases that use prisma to handle migrations.

## Adding new tables

To add a new table on the db you need to a new model to the schema.prisma and apply to migration by running
in the `repocop` directory
```
npx prisma migrate dev --name migration-name
```

At the moment it is not possible to have more than 
one scheme.prisma file.


