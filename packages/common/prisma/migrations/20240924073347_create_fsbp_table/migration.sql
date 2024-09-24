-- CreateTable
CREATE TABLE "cloudbuster_fsbp_vulnerabilities" (
    "arn" TEXT NOT NULL,
    "aws_account_id" TEXT NOT NULL,
    "aws_account_name" TEXT,
    "aws_region" TEXT NOT NULL,
    "control_id" TEXT NOT NULL,
    "first_observed_at" TIMESTAMP(6),
    "repo" TEXT,
    "stack" TEXT,
    "stage" TEXT,
    "app" TEXT,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "within_sla" BOOLEAN NOT NULL,
    "remediation" TEXT,

    CONSTRAINT "cloudbuster_fsbp_vulnerabilities_pkey" PRIMARY KEY ("arn","control_id")
);
