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

-- Switch back to the original user
RESET role;
