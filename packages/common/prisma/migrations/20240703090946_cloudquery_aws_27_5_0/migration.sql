-- This migration is to update the CloudQuery AWS source plugin from from v26.0.0 to v27.5.0.
-- The `_cq_id` changes actually originate from v24.0.0.
-- It's not a field that we use in Prisma, so the schema wasn't updated at the time.
-- See https://hub.cloudquery.io/plugins/source/cloudquery/aws/v24.0.0/versions.

-- These indices are replaced with primary keys on the `_cq_id` column.
DROP INDEX IF EXISTS "aws_cloudformation_stacks__cq_id_key";
DROP INDEX IF EXISTS "aws_ec2_images__cq_id_key";
DROP INDEX IF EXISTS "aws_ec2_instances__cq_id_key";
DROP INDEX IF EXISTS "aws_lambda_functions__cq_id_key";
DROP INDEX IF EXISTS "aws_organizations_account_parents__cq_id_key";
DROP INDEX IF EXISTS "aws_organizations_accounts__cq_id_key";
DROP INDEX IF EXISTS "aws_organizations_organizational_units__cq_id_key";
DROP INDEX IF EXISTS "aws_s3_buckets__cq_id_key";
DROP INDEX IF EXISTS "aws_securityhub_findings__cq_id_key";
DROP INDEX IF EXISTS "idx_aws_account_name";

ALTER TABLE "aws_cloudformation_stacks" DROP CONSTRAINT "aws_cloudformation_stacks_cqpk",
ADD COLUMN     "deletion_mode" TEXT,
ADD COLUMN     "detailed_status" TEXT,
ADD CONSTRAINT "aws_cloudformation_stacks_cqpk" PRIMARY KEY ("_cq_id");

ALTER TABLE "aws_ec2_images" DROP CONSTRAINT "aws_ec2_images_cqpk",
ADD COLUMN     "deregistration_protection" TEXT,
ADD COLUMN     "last_launched_time" TEXT,
ADD CONSTRAINT "aws_ec2_images_cqpk" PRIMARY KEY ("_cq_id");

ALTER TABLE "aws_ec2_instances" DROP CONSTRAINT "aws_ec2_instances_cqpk",
ADD CONSTRAINT "aws_ec2_instances_cqpk" PRIMARY KEY ("_cq_id");

ALTER TABLE "aws_lambda_functions" DROP CONSTRAINT "aws_lambda_functions_cqpk",
ADD CONSTRAINT "aws_lambda_functions_cqpk" PRIMARY KEY ("_cq_id");

ALTER TABLE "aws_organizations_account_parents" DROP CONSTRAINT "aws_organizations_account_parents_cqpk",
ADD CONSTRAINT "aws_organizations_account_parents_cqpk" PRIMARY KEY ("_cq_id");

ALTER TABLE "aws_organizations_accounts" DROP CONSTRAINT "aws_organizations_accounts_cqpk",
ADD CONSTRAINT "aws_organizations_accounts_cqpk" PRIMARY KEY ("_cq_id");

ALTER TABLE "aws_organizations_organizational_units" DROP CONSTRAINT "aws_organizations_organizational_units_cqpk",
ADD CONSTRAINT "aws_organizations_organizational_units_cqpk" PRIMARY KEY ("_cq_id");

ALTER TABLE "aws_s3_buckets" DROP CONSTRAINT "aws_s3_buckets_cqpk",
ADD CONSTRAINT "aws_s3_buckets_cqpk" PRIMARY KEY ("_cq_id");

ALTER TABLE "aws_securityhub_findings" DROP CONSTRAINT "aws_securityhub_findings_cqpk",
ADD CONSTRAINT "aws_securityhub_findings_cqpk" PRIMARY KEY ("_cq_id");
