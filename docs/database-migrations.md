# Database Migrations

> **Note**
> The migrations are applied automatically on deploy.

## What are they?

Service Catalogue uses the [Prisma](https://www.prisma.io) ORM for database migrations,
to profit from the audit trail it provides.

Migrations are located in [../packages/common/prisma/migrations](../packages/common/prisma/migrations).

Prisma tracks the migration history in the `_prisma_migrations` table in the database.

## Creating a new migration

See https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate#create-migrations for the recommended process for developing a migration.

To create a migration file, run:

```bash
npx -w common prisma migrate dev --create-only --name [name]
```

Once you have a draft migration, apply it via:

```bash
npm -w cli start migrate -- --stage DEV
```

You can then generate a new version of the Prisma Client via:

```bash
npx -w common prisma generate
```

## Applying a migration to CODE or PROD

### Migrations as part of CD

Upon a RiffRaff deploy (to either CODE or PROD), a `prisma.zip` containing the Prisma schema and migration scripts is uploaded into the account artifact bucket. This action triggers an [ECS task](../packages/cdk/lib/prisma-migrate-task.ts) running the [`prisma-migrate`](../containers/prisma-migrate/Dockerfile) container, which retrieves the `prisma.zip` and applies the corresponding migration to the CODE/PROD RDS instance.

This migrations can fail for a number of reasons - for example attempting to add a `NOT NULL` column to a table with existing data. In this case, manual intervention will be necessary. Prisma provides some useful documentation on [patching and hotfixing](https://www.prisma.io/docs/orm/prisma-migrate/workflows/patching-and-hotfixing).

Check the logs with filter app.keyword:prisma-migrate-task if a migration fails to be applied automatically.

### Manual migrations

Although migrations are applied automatically on deploy, these documentation is preserved here in case a manual migration is necessary.

Prerequisite:

1. You have an approved Pull Request
2. You have `deployTools` credentials from Janus
3. You are connected to the VPN

You can apply a migration to CODE or PROD using the [CLI](../packages/cli)):

```bash
npm -w cli start migrate -- --stage [CODE|PROD]
```

The command above will not apply the migration without a `--confirm` flag. If satisfied with the output of the above, you can run:

```bash
npm -w cli start migrate -- --stage [CODE|PROD] --confirm
```

See also:

- https://www.prisma.io/docs/concepts/components/prisma-migrate/migrate-development-production#production-and-testing-environments
- https://www.prisma.io/docs/guides/migrate/production-troubleshooting#failed-migration
