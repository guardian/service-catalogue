CREATE TABLE IF NOT EXISTS "aws_organizations_organizational_unit_parents" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "parent_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "aws_organizations_organizational_unit_parents_cqpk" PRIMARY KEY ("_cq_id")
);

CREATE TABLE IF NOT EXISTS "aws_organizations_roots" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT NOT NULL,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "policy_types" JSONB,

    CONSTRAINT "aws_organizations_roots_cqpk" PRIMARY KEY ("_cq_id")
);
