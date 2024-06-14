-- This file is run in CI.

-- Switch to the `repocop` user and test access to `view_repo_ownership`
SET ROLE repocop;
SELECT * FROM view_repo_ownership LIMIT 1;

-- Switch back to the original user
RESET role;
