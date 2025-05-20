-- @formatter:off -- this stops IntelliJ from reformatting the SQL

BEGIN TRANSACTION;
    DROP VIEW IF EXISTS view_domain_tags;
    DROP FUNCTION IF EXISTS fn_view_domain_tags;

    CREATE FUNCTION fn_view_domain_tags() RETURNS TABLE (
        domain_name TEXT
        , app TEXT
        , stack TEXT
        , stage TEXT
        , tool TEXT
        , repo TEXT
        , riffraff_project TEXT
        , account_name TEXT
        , account_id TEXT
    ) as $$
    WITH arn_tag_sets AS (
        SELECT
            arn,
            tags,
            account_id
        FROM
            aws_cloudfront_distributions
        UNION
        SELECT
            arn,
            tags,
            account_id
        FROM
            aws_elbv1_load_balancers
        UNION
        SELECT
            arn,
            tags,
            account_id
        FROM
            aws_elbv2_load_balancers
        UNION
        SELECT
            arn,
            tags,
            account_id
        FROM
            aws_cloudformation_stacks
    ),
         domain_to_tag_sets AS (
             SELECT
                 COALESCE(fd.name, cert.domain_name) as domain_name,
                 (
                     UNNEST(
                             ARRAY_AGG(tag_sets.tags)
                     )
                     ) as tags,
                 -- Takes the fist account_id and assume they are all the same
                 (ARRAY_AGG(cert.account_id)) [1] AS account_id
             FROM
                 aws_acm_certificates AS cert
                     -- Joins on the first arn due to performance
                     LEFT JOIN arn_tag_sets AS tag_sets ON tag_sets.arn = cert.in_use_by [1]
                     LEFT JOIN aws_apigateway_domain_names AS agw ON agw.domain_name = cert.domain_name
                     LEFT JOIN aws_accounts AS acc ON cert.account_id = acc.id
                     LEFT JOIN fastly_service_backends fb ON fb.hostname = cert.domain_name
                     LEFT JOIN fastly_service_domains fd ON fd.service_id = fb.service_id
                     AND fd.service_version = fb.service_version
             GROUP BY
                 fd.name,
                 cert.domain_name
         ),
         domain_to_tag_sets_filtered AS (
             SELECT
                 *
             FROM
                 domain_to_tag_sets
             WHERE
                 tags IS NOT NULL
               AND tags != '{}'
         ),
         tool_to_tag_sets AS (
             SELECT
                 domain_tags.domain_name,
                 arn_tags.tags,
                 arn_tags.account_id
             FROM
                 domain_to_tag_sets domain_tags
                     JOIN arn_tag_sets arn_tags ON domain_tags.tags ->> 'gu:tool' = arn_tags.tags ->> 'gu:tool'
                     JOIN aws_accounts AS acc ON arn_tags.account_id = acc.id
             WHERE
                 domain_tags.tags ->> 'gu:tool' IS NOT NULL
         )
    SELECT DISTINCT
        domain_name,
        tags ->> 'App' AS app,
        tags ->> 'Stack' AS stack,
        tags ->> 'Stage' AS stage,
        tags ->> 'gu:tool' AS tool,
        COALESCE(tags ->> 'gu:application-repo', tags ->> 'gu:repo') AS repo,
        tags ->> 'gu:riff-raff:project' AS riffraff_project,
        acc.name,
        account_id
    FROM
        (
            SELECT
                *
            FROM
                domain_to_tag_sets_filtered
            UNION
            SELECT
                *
            FROM
                tool_to_tag_sets
        ) all_tags
            LEFT JOIN aws_accounts AS acc ON all_tags.account_id = acc.id;
    $$ language sql;

    CREATE VIEW view_domain_tags AS (
        SELECT  *
        FROM    fn_view_domain_tags()
    );

COMMIT TRANSACTION;
