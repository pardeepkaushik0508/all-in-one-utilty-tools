-- Expand Blog table and add full CMS schema

-- Alter Blog: add new columns
ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "author" TEXT NOT NULL DEFAULT 'UtilityTools Team';
ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "readTime" TEXT NOT NULL DEFAULT '5 min';
ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "relatedToolSlug" TEXT;
ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "scheduledAt" TIMESTAMP(3);
ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "metaTitle" TEXT;
ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "metaDescription" TEXT;
ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "keywords" JSONB;
ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "canonicalUrl" TEXT;
ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "ogTitle" TEXT;
ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "ogDescription" TEXT;
ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "robotsIndex" BOOLEAN NOT NULL DEFAULT true;

-- Migrate legacy tags JSON into keywords if keywords is null
UPDATE "Blog" SET "keywords" = "tags" WHERE "keywords" IS NULL AND "tags" IS NOT NULL;

-- Drop legacy tags column if it exists
ALTER TABLE "Blog" DROP COLUMN IF EXISTS "tags";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Blog_categoryId_idx" ON "Blog"("categoryId");
CREATE INDEX IF NOT EXISTS "Blog_createdAt_idx" ON "Blog"("createdAt" DESC);

-- CreateTable BlogCategory
CREATE TABLE IF NOT EXISTS "BlogCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'active',
    "isBuiltin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BlogCategory_name_key" ON "BlogCategory"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "BlogCategory_slug_key" ON "BlogCategory"("slug");

-- CreateTable Tag
CREATE TABLE IF NOT EXISTS "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Tag_name_key" ON "Tag"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Tag_slug_key" ON "Tag"("slug");

-- CreateTable BlogTag
CREATE TABLE IF NOT EXISTS "BlogTag" (
    "blogId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "BlogTag_pkey" PRIMARY KEY ("blogId","tagId")
);

-- CreateTable CmsPage
CREATE TABLE IF NOT EXISTS "CmsPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB,
    "sections" JSONB,
    "seo" JSONB,
    "status" TEXT NOT NULL DEFAULT 'published',
    "scheduledAt" TIMESTAMP(3),
    "revisions" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsPage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CmsPage_slug_key" ON "CmsPage"("slug");

-- CreateTable ToolSeoContent
CREATE TABLE IF NOT EXISTS "ToolSeoContent" (
    "slug" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToolSeoContent_pkey" PRIMARY KEY ("slug")
);

-- CreateTable ToolSetting
CREATE TABLE IF NOT EXISTS "ToolSetting" (
    "slug" TEXT NOT NULL,
    "toolName" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "hiddenFromSearch" BOOLEAN NOT NULL DEFAULT false,
    "hiddenFromHomepage" BOOLEAN NOT NULL DEFAULT false,
    "hiddenFromNavigation" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "scheduledEnableAt" TIMESTAMP(3),
    "scheduledDisableAt" TIMESTAMP(3),
    "maintenanceMessage" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToolSetting_pkey" PRIMARY KEY ("slug")
);

-- CreateTable NavigationConfig
CREATE TABLE IF NOT EXISTS "NavigationConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NavigationConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable MediaAsset
CREATE TABLE IF NOT EXISTS "MediaAsset" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "storedName" TEXT,
    "mimeType" TEXT,
    "size" INTEGER,
    "url" TEXT,
    "storage" TEXT,
    "localPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable ActivityLog
CREATE TABLE IF NOT EXISTS "ActivityLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt" DESC);

-- CreateTable SiteMeta
CREATE TABLE IF NOT EXISTS "SiteMeta" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteMeta_pkey" PRIMARY KEY ("key")
);

-- CreateTable AdminUser
CREATE TABLE IF NOT EXISTS "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Blog" ADD CONSTRAINT "Blog_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "BlogTag" ADD CONSTRAINT "BlogTag_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "BlogTag" ADD CONSTRAINT "BlogTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
