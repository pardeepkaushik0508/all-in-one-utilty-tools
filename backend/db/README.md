# MongoDB database layer

This backend uses **MongoDB** with **Mongoose** for CMS, blog, and content storage.

## Setup

1. Set `DATABASE_URL` in `backend/.env` (see `.env.example`).
2. Run the idempotent seed:

```bash
npm run db:setup --workspace backend
```

## Collections

| Collection | Purpose |
|------------|---------|
| `Blog` | Blog posts |
| `BlogCategory` | Blog categories |
| `Tag` | Tag names/slugs |
| `BlogTag` | Blog ↔ Tag relationships |
| `CmsPage` | CMS pages |
| `ToolSeoContent` | Per-tool SEO JSON |
| `ToolSetting` | Tool enable/disable settings |
| `NavigationConfig` | Header/footer navigation |
| `MediaAsset` | CMS media metadata |
| `ActivityLog` | Admin activity audit log |
| `SiteMeta` | Key/value store (e.g. cache version) |
| `AdminUser` | Admin users (schema ready; auth uses env vars) |

## Deploy

On startup, `scripts/start-backend.sh` runs `db/seed.js` when `DATABASE_URL` is set.
