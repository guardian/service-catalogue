ALTER TABLE "aws_cloudformation_stacks"
    ADD COLUMN IF NOT EXISTS "last_operations" JSONB;

ALTER TABLE "aws_cloudformation_stacks"
    ADD COLUMN IF NOT EXISTS "deployment_config" JSONB;

ALTER TABLE "aws_ec2_images"
    ADD COLUMN IF NOT EXISTS "public_ssm_parameter_name" TEXT,
    ADD COLUMN IF NOT EXISTS "image_watermarks" JSONB;

ALTER TABLE "aws_organizations_accounts"
    ADD COLUMN IF NOT EXISTS "paths" TEXT[];
