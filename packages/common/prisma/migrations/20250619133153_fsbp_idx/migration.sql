CREATE INDEX IF NOT EXISTS "idx_region"       ON "aws_securityhub_findings" ("region");
CREATE INDEX IF NOT EXISTS "idx_control_id"   ON "aws_securityhub_findings"((product_fields->>'ControlId'));
-- Normalized severity score is deprecated, replace with severity label https://docs.aws.amazon.com/securityhub/1.0/APIReference/API_Severity.html
-- introduced in 20240410101502_aws_securityhub_findings
CREATE INDEX IF NOT EXISTS "idx_severity"     ON "aws_securityhub_findings"((severity->>'Label'));
DROP INDEX   IF     EXISTS "idx_severity_normalized";

CREATE INDEX IF NOT EXISTS "idx_account_name" ON "cloudbuster_fsbp_vulnerabilities" ("aws_account_name");
CREATE INDEX IF NOT EXISTS "idx_aws_region"   ON "cloudbuster_fsbp_vulnerabilities" ("aws_region");
CREATE INDEX IF NOT EXISTS "idx_control_id"   ON "cloudbuster_fsbp_vulnerabilities" ("control_id");
CREATE INDEX IF NOT EXISTS "idx_severity"     ON "cloudbuster_fsbp_vulnerabilities" ("severity");
CREATE INDEX IF NOT EXISTS "idx_within_sla"   ON "cloudbuster_fsbp_vulnerabilities" ("within_sla");
