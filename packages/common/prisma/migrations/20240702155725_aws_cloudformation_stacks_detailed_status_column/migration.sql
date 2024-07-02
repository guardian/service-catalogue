-- The detailed_status column was added in CloudQuery version v25.2.1
ALTER TABLE "aws_cloudformation_stacks" DROP CONSTRAINT "aws_cloudformation_stacks_cqpk",
ADD COLUMN     "detailed_status" TEXT,
ALTER COLUMN "arn" DROP NOT NULL,
ADD CONSTRAINT "aws_cloudformation_stacks_cqpk" PRIMARY KEY ("_cq_id");
