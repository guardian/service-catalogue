/*
  Warnings:

  - You are about to drop the column `issue_counts_by_severity` on the `snyk_projects` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `snyk_projects` table. All the data in the column will be lost.
  - You are about to drop the column `org_id` on the `snyk_projects` table. All the data in the column will be lost.
  - You are about to drop the column `origin` on the `snyk_projects` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `snyk_projects` table. All the data in the column will be lost.
  - You are about to drop the `snyk_reporting_latest_issues` table. If the table is not empty, all the data it contains will be lost.

*/

DROP VIEW IF EXISTS "view_snyk_project_tags";

-- AlterTable
ALTER TABLE "snyk_projects" DROP COLUMN "issue_counts_by_severity",
DROP COLUMN "name",
DROP COLUMN "org_id",
DROP COLUMN "origin",
DROP COLUMN "tags",
ADD COLUMN     "attributes" JSONB,
ADD COLUMN     "meta" JSONB,
ADD COLUMN     "relationships" JSONB,
ADD COLUMN     "type" TEXT;

-- DropTable
DROP TABLE "snyk_reporting_latest_issues";

-- CreateTable
CREATE TABLE "snyk_issues" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "attributes" JSONB,
    "id" TEXT NOT NULL,
    "type" TEXT,

    CONSTRAINT "snyk_issues_cqpk" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "snyk_issues__cq_id_key" ON "snyk_issues"("_cq_id");
