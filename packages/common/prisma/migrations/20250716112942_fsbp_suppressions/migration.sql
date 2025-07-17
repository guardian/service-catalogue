-- This is an empty migration.
ALTER TABLE cloudbuster_fsbp_vulnerabilities DROP COLUMN IF EXISTS suppressed;
ALTER TABLE cloudbuster_fsbp_vulnerabilities ADD COLUMN suppressed BOOLEAN NOT NULL DEFAULT FALSE;

-- replace key constraint
ALTER TABLE cloudbuster_fsbp_vulnerabilities DROP CONSTRAINT IF EXISTS cloudbuster_fsbp_vulnerabilities_pkey;
ALTER TABLE cloudbuster_fsbp_vulnerabilities ADD CONSTRAINT cloudbuster_fsbp_vulnerabilities_pkey PRIMARY KEY (arn, control_id, aws_region);
