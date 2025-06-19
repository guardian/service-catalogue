CREATE INDEX IF NOT EXISTS "account_id_idx"   ON "aws_securityhub_findings" ("aws_account_id");
CREATE INDEX IF NOT EXISTS "region_idx"       ON "aws_securityhub_findings" ("request_region");
CREATE INDEX IF NOT EXISTS "product_name_idx" ON "aws_securityhub_findings" ("product_name");

CREATE INDEX IF NOT EXISTS "account_name_idx" ON "cloudbuster_fsbp_vulnerabilities" ("aws_account_name");
CREATE INDEX IF NOT EXISTS "account_id_idx"   ON "cloudbuster_fsbp_vulnerabilities" ("aws_account_id");
CREATE INDEX IF NOT EXISTS "aws_region"       ON "cloudbuster_fsbp_vulnerabilities" ("aws_region");
CREATE INDEX IF NOT EXISTS "control_id_idx"   ON "cloudbuster_fsbp_vulnerabilities" ("control_id");
CREATE INDEX IF NOT EXISTS "within_sla_idx"   ON "cloudbuster_fsbp_vulnerabilities" ("within_sla");
