-- This file is run in CI.

-- Switch to the `repocop` user and test access to `view_repo_ownership`
SET ROLE repocop;
SELECT * FROM view_repo_ownership LIMIT 1;
SELECT * FROM obligatron_results LIMIT 1;


-- Obligatron should have read access to all tables, and write access to `obligatron_results`
SET ROLE obligatron;
SELECT * FROM github_repositories LIMIT 1;
INSERT INTO obligatron_results
(
    date
    , obligation_name
    , resource
    , reason
    , contacts
)
VALUES (
    '2020-01-01'
    , 'OBLIGATION'
    , 'guardian/myrepo'
    , 'vulnerabilities'
    , '{}'
);

DELETE FROM obligatron_results
WHERE obligation_name = 'OBLIGATION';

-- Switch to the `cloudbuster` user and test access to the tables used in the cloudbuster app
SET ROLE cloudbuster;
-- It should be able to read from this table
SELECT * FROM aws_securityhub_findings LIMIT 1;
INSERT INTO cloudbuster_fsbp_vulnerabilities
(
    arn
    , aws_account_id
    , aws_region
    , control_id
    , severity
    , title
    , within_sla
)
VALUES (
    'arn:aws:securityhub:eu-west-1:123456789012:product/aws/securityhub/finding/12345678901234567890123456789012'
    , '123456789012'
    , 'eu-west-1'
    , 'control-id'
    , 'CRITICAL'
    , 'title'
    , TRUE
);

DELETE FROM cloudbuster_fsbp_vulnerabilities
WHERE arn = 'arn:aws:securityhub:eu-west-1:123456789012:product/aws/securityhub/finding/12345678901234567890123456789012';

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

DELETE FROM guardian_github_actions_usage
WHERE full_name = 'guardian/service-catalogue';


-- Switch back to the original user
RESET role;
