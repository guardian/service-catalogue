/*
  Warnings:

  - You are about to drop the column `issue_counts_by_severity` on the `snyk_projects` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `snyk_projects` table. All the data in the column will be lost.
  - You are about to drop the column `org_id` on the `snyk_projects` table. All the data in the column will be lost.
  - You are about to drop the column `origin` on the `snyk_projects` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `snyk_projects` table. All the data in the column will be lost.
  - You are about to drop the `snyk_reporting_latest_issues` table. If the table is not empty, all the data it contains will be lost.

*/

-- DropTable
DROP VIEW IF EXISTS "view_snyk_project_tags";
DROP TABLE IF EXISTS "snyk_dependencies";
DROP TABLE IF EXISTS "snyk_groups";
DROP TABLE IF EXISTS "snyk_group_members";
DROP TABLE IF EXISTS "snyk_integrations";
DROP TABLE IF EXISTS "snyk_organizations";
DROP TABLE IF EXISTS "snyk_organization_members";
DROP TABLE IF EXISTS "snyk_organization_provisions";
DROP TABLE IF EXISTS "snyk_reporting_issues";
DROP TABLE IF EXISTS "snyk_reporting_latest_issues";


-- AlterTable
ALTER TABLE "snyk_projects" DROP COLUMN "issue_counts_by_severity",
DROP COLUMN "name",
DROP COLUMN "org_id",
DROP COLUMN "origin",
DROP COLUMN "tags",
ADD COLUMN     "attributes" JSONB,
ADD COLUMN     "meta" JSONB,
ADD COLUMN     "organization_id" TEXT,
ADD COLUMN     "relationships" JSONB,
ADD COLUMN     "type" TEXT;

-- CreateTable
CREATE TABLE "snyk_issues" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "organization_id" TEXT,
    "attributes" JSONB,
    "id" TEXT NOT NULL,
    "relationships" JSONB,
    "type" TEXT,

    CONSTRAINT "snyk_issues_cqpk" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "snyk_issues__cq_id_key" ON "snyk_issues"("_cq_id");
