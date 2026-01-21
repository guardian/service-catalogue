# Database Migrations

## What are they?

Service Catalogue uses the [Prisma](https://www.prisma.io) ORM for database migrations,
to profit from the audit trail it provides.

Migrations are located in [../packages/common/prisma/migrations](../packages/common/prisma/migrations).

Prisma tracks the migration history in the `_prisma_migrations` table in the database.

## Creating a new migration

See https://www.prisma.io/docs/orm/prisma-migrate/getting-started for the recommended process for developing a migration.

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

### Creating a view

When adding a view, be sure to create it as a select on a function to not block CloudQuery schema changes being applied.

> [!Warning]
> Selecting on a function allows for schema changes to take place but may cause the view to break if they do occur.

Example: [view_aws_vpcs](../packages/common/prisma/migrations/20250212092300_view_aws_vpcs)

### Troubleshooting

#### 'ERROR: relation [relation] does not exist'

If your migration references a relation not in Prisma you many need to add a migration to resolve it.

Example [view](../packages/common/prisma/migrations/20250212092300_view_aws_vpcs) with reference to [tables](../packages/common/prisma/migrations/20250212092000_aws_vpc_tables).

Steps:

1. Set [docker-composer db_copy tables](../packages/dev-environment/docker-compose.yaml) to include ONLY the missing relation
2. Remove --data-only flag from db_copy container [entrypoint.sh](../containers/db-copy/entrypoint.sh) (restore before committing)
3. Use [introspection to update the Prisma schema](https://www.prisma.io/docs/orm/prisma-migrate/getting-started#introspect-to-create-or-update-your-prisma-schema).
4. [Optional] Add @@ignore to generated schema entries which types aren't required for
5. Run Shell`npx -w common prisma migrate reset`
6. Run Shell`npx -w common prisma migrate dev --create-only --name [name]`
7. Create either a separate migration or append to the end of the created one.

## Applying a migration to CODE or PROD

### Migrations as part of CD

Upon a RiffRaff deploy (to either CODE or PROD), a `prisma.zip` containing the Prisma schema and migration scripts is uploaded into the account artifact bucket. This action triggers an [ECS task](../packages/cdk/lib/prisma-migrate-task.ts) running the [`prisma-migrate`](../containers/prisma-migrate/Dockerfile) container, which retrieves the `prisma.zip` and applies the corresponding migration to the CODE/PROD RDS instance.

This migrations can fail for a number of reasons - for example attempting to add a `NOT NULL` column to a table with existing data. In this case, manual intervention will be necessary. Prisma provides some useful documentation on [patching and hotfixing](https://www.prisma.io/docs/orm/prisma-migrate/workflows/patching-and-hotfixing).

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

- https://www.prisma.io/docs/orm/prisma-client/deployment/deploy-database-changes-with-prisma-migrate
- https://www.prisma.io/docs/orm/prisma-migrate/workflows/patching-and-hotfixing#fixing-failed-migrations-with-migrate-diff-and-db-execute
