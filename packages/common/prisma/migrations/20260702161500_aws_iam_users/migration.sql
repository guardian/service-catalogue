BEGIN TRANSACTION;
    CREATE TABLE IF NOT EXISTS "aws_iam_users" (
        "_cq_sync_time" TIMESTAMP(6),
        "_cq_source_name" TEXT,
        "_cq_id" UUID NOT NULL,
        "_cq_parent_id" UUID,
        "account_id" TEXT,
        "arn" TEXT,
        "tags" JSONB,
        "create_date" TIMESTAMP(6),
        "path" TEXT,
        "user_id" TEXT,
        "user_name" TEXT,
        "password_last_used" TIMESTAMP(6),
        "permissions_boundary" JSONB,

        CONSTRAINT "aws_iam_users_cqpk" PRIMARY KEY ("_cq_id")
    );

    CREATE TABLE IF NOT EXISTS "aws_iam_credential_reports" (
        "_cq_sync_time" TIMESTAMP(6),
        "_cq_source_name" TEXT,
        "_cq_id" UUID NOT NULL,
        "_cq_parent_id" UUID,
        "arn" TEXT,
        "user_creation_time" TIMESTAMP(6),
        "password_last_changed" TIMESTAMP(6),
        "password_next_rotation" TIMESTAMP(6),
        "access_key_1_last_rotated" TIMESTAMP(6),
        "access_key_2_last_rotated" TIMESTAMP(6),
        "cert_1_last_rotated" TIMESTAMP(6),
        "cert_2_last_rotated" TIMESTAMP(6),
        "access_key_1_last_used_date" TIMESTAMP(6),
        "access_key_2_last_used_date" TIMESTAMP(6),
        "password_last_used" TIMESTAMP(6),
        "password_enabled" TEXT,
        "user" TEXT,
        "password_status" TEXT,
        "mfa_active" BOOLEAN,
        "access_key1_active" BOOLEAN,
        "access_key2_active" BOOLEAN,
        "cert1_active" BOOLEAN,
        "cert2_active" BOOLEAN,
        "access_key1_last_used_region" TEXT,
        "access_key1_last_used_service" TEXT,
        "access_key2_last_used_region" TEXT,
        "access_key2_last_used_service" TEXT,
        "account_id" TEXT,

        CONSTRAINT "aws_iam_credential_reports_cqpk" PRIMARY KEY ("_cq_id")
    );

    ALTER TABLE "aws_organizations_accounts" ADD COLUMN IF NOT EXISTS "state" TEXT;
COMMIT TRANSACTION;
