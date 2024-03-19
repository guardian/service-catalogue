# Database Migrations

> **Note**
> The migration process is currently manual.

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

Prerequisite:

1. You have an approved Pull Request
2. You have `deployTools` credentials from Janus
3. You are connected to the VPN

You can apply a migration to CODE or PROD using the [CLI](../packages/cli)):

```bash
npm -w cli start migrate -- --stage [CODE|PROD]
```

See also:

- https://www.prisma.io/docs/concepts/components/prisma-migrate/migrate-development-production#production-and-testing-environments
- https://www.prisma.io/docs/guides/migrate/production-troubleshooting#failed-migration
