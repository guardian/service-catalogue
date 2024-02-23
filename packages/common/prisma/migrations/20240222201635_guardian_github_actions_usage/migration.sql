DROP TABLE IF EXISTS guardian_github_actions_usage;

CREATE TABLE guardian_github_actions_usage (
    evaluated_on TIMESTAMP(3) NOT NULL,
    full_name TEXT NOT NULL,
    workflow_path TEXT NOT NULL,
    workflow_uses TEXT[] NOT NULL
);

CREATE UNIQUE INDEX guardian_github_actions_usage_full_name_key ON guardian_github_actions_usage(full_name, workflow_path);

DROP VIEW IF EXISTS view_github_actions;

CREATE VIEW view_github_actions AS
    WITH data AS (
        SELECT  tbl.evaluated_on
                , tbl.full_name
                , tbl.workflow_path
                , use_string AS action
                , split_part(use_string, '@', 1) AS action_name -- after splitting, take the first item
                , split_part(use_string, '@', -1) AS version -- after splitting, take the last item
        FROM    guardian_github_actions_usage tbl
                , unnest(tbl.workflow_uses) AS use_string -- expand the string array into rows, e.g. an array of 2 items becomes 2 rows
    )

    SELECT  d.evaluated_on
            , d.full_name
            , r.archived
            , d.workflow_path
            , d.action
            , d.action_name
            , d.version
    FROM    data d
            JOIN github_repositories r ON d.full_name = r.full_name;
