-- AlterTable
ALTER TABLE "aws_ec2_images" ALTER COLUMN "account_id" DROP NOT NULL,
ALTER COLUMN "region" DROP NOT NULL,
ALTER COLUMN "arn" DROP NOT NULL;

-- AlterTable
ALTER TABLE "aws_lambda_functions" ALTER COLUMN "arn" DROP NOT NULL;

-- AlterTable
ALTER TABLE "aws_organizations_account_parents" ALTER COLUMN "request_account_id" DROP NOT NULL,
ALTER COLUMN "id" DROP NOT NULL,
ALTER COLUMN "parent_id" DROP NOT NULL,
ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "aws_organizations_accounts" ALTER COLUMN "request_account_id" DROP NOT NULL,
ALTER COLUMN "arn" DROP NOT NULL;

-- AlterTable
ALTER TABLE "aws_organizations_organizational_unit_parents" ALTER COLUMN "request_account_id" DROP NOT NULL,
ALTER COLUMN "id" DROP NOT NULL,
ALTER COLUMN "parent_id" DROP NOT NULL,
ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "aws_organizations_organizational_units" ALTER COLUMN "request_account_id" DROP NOT NULL,
ALTER COLUMN "arn" DROP NOT NULL;

-- AlterTable
ALTER TABLE "aws_organizations_roots" ALTER COLUMN "request_account_id" DROP NOT NULL,
ALTER COLUMN "arn" DROP NOT NULL,
ALTER COLUMN "id" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "aws_s3_buckets" ALTER COLUMN "arn" DROP NOT NULL;

-- AlterTable
ALTER TABLE "aws_securityhub_findings" ALTER COLUMN "request_account_id" DROP NOT NULL,
ALTER COLUMN "request_region" DROP NOT NULL,
ALTER COLUMN "aws_account_id" DROP NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "generator_id" DROP NOT NULL,
ALTER COLUMN "id" DROP NOT NULL,
ALTER COLUMN "product_arn" DROP NOT NULL,
ALTER COLUMN "schema_version" DROP NOT NULL,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "region" DROP NOT NULL;
