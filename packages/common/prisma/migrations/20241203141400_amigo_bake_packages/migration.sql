-- CreateTable
CREATE TABLE IF NOT EXISTS "amigo_bake_packages"
(
    "_cq_sync_time"   TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id"          UUID      NOT NULL,
    "_cq_parent_id"   UUID,
    "base_name"       TEXT      NOT NULL,
    "base_ami_id"     TEXT      NOT NULL,
    "base_eol_date"   TIMESTAMP NOT NULL,
    "recipe_id"       TEXT      NOT NULL,
    "bake_number"     INTEGER   NOT NULL,
    "source_ami_id"   TEXT      NOT NULL,
    "started_at"      TIMESTAMP NOT NULL,
    "started_by"      TEXT      NOT NULL,
    "package_name"    TEXT      NOT NULL,
    "package_version" TEXT      NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "amigo_bake_packages__cq_id_key" ON "amigo_bake_packages" ("_cq_id");
