-- CreateTable
CREATE TABLE IF NOT EXISTS "github_repository_custom_properties" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "property_name" TEXT NOT NULL,
    "repository_id" BIGINT NOT NULL,
    "value" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "github_repository_custom_properties__cq_id_key" ON "github_repository_custom_properties"("_cq_id");
