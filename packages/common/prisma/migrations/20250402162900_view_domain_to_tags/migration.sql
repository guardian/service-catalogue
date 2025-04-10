CREATE OR REPLACE VIEW view_domain_tags AS
(
WITH domain_to_tag_sets AS (SELECT COALESCE(fd.name, cert.domain_name) as domain_name,
                                   (
                                       unnest(
                                               array_agg(cert.tags) || array_agg(cfd.tags) || array_agg(lb1.tags) ||
                                               array_agg(lb2.tags) || array_agg(agw.tags)
                                       )
                                       )                               as tags,
                                   (array_agg(acc.name))[1]            AS account_name,
                                   (array_agg(cert.account_id))[1]     AS account_id
                            FROM aws_acm_certificates AS cert
                                     LEFT JOIN aws_cloudfront_distributions AS cfd ON cfd.arn = cert.in_use_by[1]
                                     LEFT JOIN aws_elbv1_load_balancers AS lb1 ON lb1.arn = cert.in_use_by[1]
                                     LEFT JOIN aws_elbv2_load_balancers AS lb2 ON lb2.arn = cert.in_use_by[1]
                                     LEFT JOIN aws_apigateway_domain_names AS agw ON agw.domain_name = cert.domain_name
                                     LEFT JOIN aws_accounts AS acc ON cert.account_id = acc.id
                                     LEFT JOIN fastly_service_backends fb ON fb.hostname = cert.domain_name
                                     LEFT JOIN fastly_service_domains fd ON fd.service_id = fb.service_id
                                AND fd.service_version = fb.service_version
                            GROUP BY fd.name,
                                     cert.domain_name),
     domain_to_tag_sets_filtered AS (SELECT *
                                     FROM domain_to_tag_sets
                                     WHERE tags IS NOT NULL
                                       AND tags != '{}'),
     domain_to_tags_additions(
                              domain_name,
                              app,
                              stack,
                              stage,
                              repo,
                              riffraff,
                              account_name,
                              account_id
         ) AS (VALUES ('workflow.gutools.co.uk',
                       'workflow-frontend',
                       'workflow',
                       'PROD',
                       'guardian/workflow-frontend',
                       'Editorial Tools::Workflow Frontend',
                       'CMS Workflow',
                       '753338109777'),
                      ('workflow.gutools.co.uk',
                       'workflow',
                       'workflow',
                       'PROD',
                       'guardian/workflow',
                       'Editorial Tools::Workflow',
                       'CMS Workflow',
                       '753338109777'))
SELECT DISTINCT domain_name,
                tags ->> 'App'                  AS app,
                tags ->> 'Stack'                AS stack,
                tags ->> 'Stage'                AS stage,
                tags ->> 'gu:repo'              AS repo,
                tags ->> 'gu:riff-raff:project' AS riffraff,
                account_name,
                account_id
FROM domain_to_tag_sets_filtered
UNION
SELECT *
FROM domain_to_tags_additions

    )