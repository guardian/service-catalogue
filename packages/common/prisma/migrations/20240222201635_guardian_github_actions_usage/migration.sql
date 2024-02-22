DROP TABLE IF EXISTS guardian_github_actions_usage;

CREATE TABLE guardian_github_actions_usage (
    evaluated_on TIMESTAMP(3) NOT NULL,
    full_name TEXT NOT NULL,
    workflow_path TEXT NOT NULL,
    workflow_uses TEXT[] NOT NULL
);

CREATE UNIQUE INDEX guardian_github_actions_usage_full_name_key ON guardian_github_actions_usage(full_name, workflow_path);
