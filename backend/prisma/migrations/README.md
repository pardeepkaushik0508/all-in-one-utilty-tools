# Prisma migrations

Migrations are expected to be generated via:

- `npx prisma generate`
- `npx prisma migrate deploy`

This repo intentionally does not commit generated migration files in this patch; Render should run the migrate deploy step on first build after you generate migrations in your environment.

