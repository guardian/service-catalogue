-- CreateTable
CREATE TABLE "snyk_dependencies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "organization_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT,
    "type" TEXT,
    "version" TEXT,
    "latest_version" TEXT,
    "latest_version_published_date" TIMESTAMP(6),
    "first_published_date" TIMESTAMP(6),
    "is_deprecated" BOOLEAN,
    "deprecated_versions" TEXT[],
    "dependencies_with_issues" TEXT[],
    "issues_critical" BIGINT,
    "issues_high" BIGINT,
    "issues_medium" BIGINT,
    "issues_low" BIGINT,
    "licenses" JSONB,
    "projects" JSONB,
    "copyright" TEXT[],

    CONSTRAINT "snyk_dependencies_cqpk" PRIMARY KEY ("organization_id","id")
);

-- CreateTable
CREATE TABLE "snyk_group_members" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "group_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "email" TEXT,
    "orgs" JSONB,
    "group_role" TEXT,

    CONSTRAINT "snyk_group_members_cqpk" PRIMARY KEY ("group_id","id")
);

-- CreateTable
CREATE TABLE "snyk_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "id" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "snyk_groups_cqpk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snyk_integrations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "organization_id" TEXT NOT NULL,
    "settings" JSONB,
    "credentials" JSONB,
    "id" TEXT NOT NULL,
    "type" TEXT,

    CONSTRAINT "snyk_integrations_cqpk" PRIMARY KEY ("organization_id","id")
);

-- CreateTable
CREATE TABLE "snyk_organization_members" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "organization_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "username" TEXT,
    "name" TEXT,
    "email" TEXT,
    "role" TEXT,

    CONSTRAINT "snyk_organization_members_cqpk" PRIMARY KEY ("organization_id","id")
);

-- CreateTable
CREATE TABLE "snyk_organization_provisions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "organization_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "role_public_id" TEXT,
    "created" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "snyk_organization_provisions_cqpk" PRIMARY KEY ("organization_id","email","created")
);

-- CreateTable
CREATE TABLE "snyk_organizations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "group" JSONB,
    "id" TEXT NOT NULL,
    "name" TEXT,
    "slug" TEXT,
    "url" TEXT,

    CONSTRAINT "snyk_organizations_cqpk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snyk_projects" (
    "_cq_source_name" TEXT,
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "id" TEXT NOT NULL,
    "name" TEXT,
    "origin" TEXT,
    "issue_counts_by_severity" JSONB,
    "tags" JSONB,
    "org_id" TEXT,

    CONSTRAINT "snyk_projects_cqpk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snyk_reporting_issues" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "organization_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "issue" JSONB,
    "projects" JSONB,
    "project" JSONB,
    "is_fixed" BOOLEAN,
    "introduced_date" TEXT,
    "patched_date" TEXT,
    "fixed_date" TEXT,

    CONSTRAINT "snyk_reporting_issues_cqpk" PRIMARY KEY ("organization_id","id")
);

-- CreateTable
CREATE TABLE "snyk_reporting_latest_issues" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "organization_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "issue" JSONB,
    "projects" JSONB,
    "project" JSONB,
    "is_fixed" BOOLEAN,
    "introduced_date" TEXT,
    "patched_date" TEXT,
    "fixed_date" TEXT,

    CONSTRAINT "snyk_reporting_latest_issues_cqpk" PRIMARY KEY ("organization_id","id")
);

-- CreateIndex
CREATE UNIQUE INDEX "snyk_dependencies__cq_id_key" ON "snyk_dependencies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "snyk_group_members__cq_id_key" ON "snyk_group_members"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "snyk_groups__cq_id_key" ON "snyk_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "snyk_integrations__cq_id_key" ON "snyk_integrations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "snyk_organization_members__cq_id_key" ON "snyk_organization_members"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "snyk_organization_provisions__cq_id_key" ON "snyk_organization_provisions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "snyk_organizations__cq_id_key" ON "snyk_organizations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "snyk_projects__cq_id_key" ON "snyk_projects"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "snyk_reporting_issues__cq_id_key" ON "snyk_reporting_issues"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "snyk_reporting_latest_issues__cq_id_key" ON "snyk_reporting_latest_issues"("_cq_id");
