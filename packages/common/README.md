## Common

This package contains code used by multiple parts of the service catalogue.
This might include utility functions, shared types, and DB query functions.
It also contains prisma migration scripts, and the prisma schema file.

### Prisma migrations

The database can be migrated locally using the `cli` package. Deploying to CODE
or PROD automatically triggers an attempted migration. You can view the logs
for these by looking in the DevX section of ELK and filtering by
`app.keyword : "prisma-migrate-task"`.
