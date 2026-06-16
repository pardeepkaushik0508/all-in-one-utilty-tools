# Database Migrations

This project uses [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate) with PostgreSQL.

## Local setup

1. Set `DATABASE_URL` in `backend/.env` (see `.env.example`).
2. Run from the repo root or `backend/`:

```bash
npm run db:setup --workspace backend
```

This runs `prisma generate`, `prisma migrate deploy`, and the idempotent seed script.

## Render / Railway deploy

The backend start script (`scripts/start-backend.sh`) automatically runs:

- `prisma generate`
- `prisma migrate deploy`
- `node prisma/seed.js` (idempotent — safe on every deploy)

Ensure `DATABASE_URL` is set in your hosting provider's environment variables.

## Migrations

| Migration | Description |
|-----------|-------------|
| `20260616102000_create_blog_table` | Initial `Blog` table |
| `20260616120000_full_cms_schema` | Full CMS schema: categories, tags, pages, navigation, tool settings, media, activity log |

## Seed data

- `prisma/seed-data/static-blogs.json` — 20 legacy blog posts imported on first seed
- `data/seo-content.json` — legacy CMS file imported into DB tables on seed

Re-run seed safely: `npm run seed --workspace backend`
