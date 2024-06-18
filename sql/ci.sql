-- This file is run in CI.

-- Switch to the `repocop` user and test access to `view_repo_ownership`
SET ROLE repocop;
SELECT * FROM view_repo_ownership LIMIT 1;

-- Switch to the `dataaudit` user and test access to the tables/views used in the data-audit app
SET ROLE dataaudit;
-- It should be able to read from these tables
SELECT * FROM aws_s3_buckets LIMIT 1;
SELECT * FROM aws_lambda_functions LIMIT 1;
SELECT * FROM aws_accounts LIMIT 1;

-- It should be able to read/write from the table audit_results
INSERT INTO audit_results (
    evaluated_on
    , name
    , success
    , cloudquery_total
    , vendor_total
) VALUES (
    NOW()
    , 'test'
    , TRUE
    , 1
    , 1
);
SELECT * FROM audit_results LIMIT 1;

-- The user github_actions_usage...
SET ROLE github_actions_usage;

-- ...should be able to read from these tables
SELECT * FROM github_workflows LIMIT 1;
SELECT * FROM github_repositories LIMIT 1;

-- ...and read/write to the table guardian_github_actions_usage
INSERT INTO guardian_github_actions_usage (
    evaluated_on
    , full_name
    , workflow_path
    , workflow_uses
) VALUES (
    NOW()
    , 'guardian/service-catalogue'
    , '.github/workflows/ci.yml'
    , ARRAY['guardian/actions-riffraff@v4']
);
SELECT * FROM guardian_github_actions_usage LIMIT 1;


-- Switch back to the original user
RESET role;
