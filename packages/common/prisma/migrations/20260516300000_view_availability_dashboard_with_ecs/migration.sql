-- @formatter:off -- this stops IntelliJ from reformatting the SQL
BEGIN TRANSACTION;
    CREATE TABLE IF NOT EXISTS aws_ecs_cluster_services (
        _cq_sync_time                       TIMESTAMP(6)
        , _cq_source_name                   TEXT
        , _cq_id                            UUID NOT NULL
        , _cq_parent_id                     UUID
        , account_id                        TEXT
        , region                            TEXT
        , arn                               TEXT
        , tags                              JSONB
        , capacity_provider_strategy        JSONB
        , cluster_arn                       TEXT
        , created_at                        TIMESTAMP(6)
        , created_by                        TEXT
        , deployment_configuration          JSONB
        , deployment_controller             JSONB
        , deployments                       JSONB
        , desired_count                     BIGINT
        , enable_ecs_managed_tags           BOOLEAN
        , enable_execute_command            BOOLEAN
        , events                            JSONB
        , health_check_grace_period_seconds BIGINT
        , launch_type                       TEXT
        , load_balancers                    JSONB
        , network_configuration             JSONB
        , pending_count                     BIGINT
        , placement_constraints             JSONB
        , placement_strategy                JSONB
        , platform_family                   TEXT
        , platform_version                  TEXT
        , propagate_tags                    TEXT
        , role_arn                          TEXT
        , running_count                     BIGINT
        , scheduling_strategy               TEXT
        , service_arn                       TEXT
        , service_name                      TEXT
        , service_registries                JSONB
        , status                            TEXT
        , task_definition                   TEXT
        , task_sets                         JSONB
        , availability_zone_rebalancing     TEXT

        , CONSTRAINT aws_ecs_cluster_services_cqpk PRIMARY KEY (_cq_id)
    );

    DROP VIEW IF EXISTS view_availability_dashboard;
    DROP FUNCTION IF EXISTS fn_view_availability_dashboard;

    CREATE FUNCTION fn_view_availability_dashboard() RETURNS TABLE (
        account_id TEXT
        , account_name TEXT
        , region TEXT
        , service_name TEXT
        , load_balancer_type TEXT
        , load_balancer_arn  TEXT
        , load_balancer_name TEXT
        , stack TEXT
        , stage TEXT
        , app TEXT
        , repo TEXT
        , riffraff_project TEXT
        , target_group_arn TEXT
        , target_group_origin_type TEXT
        , target_group_origin_arn TEXT
        , target_group_origin_name TEXT
        , elk_index TEXT
        , grafana_cloudwatch_datasource TEXT
        , kibana_space TEXT
        , slo DOUBLE PRECISION
        , state_value TEXT
        , domain_names TEXT[]
    ) AS $$
        WITH slos AS (
            SELECT  FORMAT('arn:aws:elasticloadbalancing:%1$s:%2$s:loadbalancer/%3$s', region, account_id, load_balancer_identifier) AS load_balancer_arn
                    , state_value
                    , 1 - threshold AS slo
            FROM    aws_cloudwatch_alarms
                    , COALESCE(
                        metrics->-1#>'{MetricStat,Metric,Dimensions}'->0#>'{Value}'#>>'{}'
                        , metrics->1#>'{MetricStat,Metric,Dimensions}'->0#>'{Value}'#>>'{}'
                    ) AS load_balancer_identifier
            WHERE   alarm_name LIKE 'child-alarm-short-period-Slow%'
        )
        , domain_info AS (
            -- NOTE: This query doesn't work for all cases, for example Grid (Stack=media-service) where one certificate w/multiple SANs is used by multiple load balancers of different domains.
            -- TODO:
            --  - Include subject_alternative_names column?
            --  - Include values from tables fastly_service_backends, ns1_records?
            SELECT      UNNEST(in_use_by) AS load_balancer_arn
                        , ARRAY_AGG(domain_name) AS domain_names
            FROM        aws_acm_certificates
            GROUP BY    in_use_by
        )
        , ec2_clb_data AS (
            SELECT  lb.account_id
                    , lb.region

                    -- Fallback to ASG tags when the load balancer isn't tagged
                    , COALESCE(
                        ARRAY_TO_STRING(ARRAY[lb.tags ->> 'App', lb.tags ->> 'Stack', lb.tags ->> 'Stage'], '-')
                        , ARRAY_TO_STRING(ARRAY[asg.tags ->> 'App', asg.tags ->> 'Stack', asg.tags ->> 'Stage'], '-')
                      ) AS service_name

                    , 'clb' AS load_balancer_type
                    , lb.arn AS load_balancer_arn
                    , lb.load_balancer_name

                     , asg.tags ->> 'Stack' AS stack
                     , asg.tags ->> 'Stage' AS stage
                     , asg.tags ->> 'App' AS app
                     , asg.tags ->> 'gu:repo' AS repo
                     , asg.tags ->> 'gu:riff-raff:project' AS riffraff_project

                    , asg.arn AS target_group_arn
                    , 'asg' AS target_group_origin_type
                    , asg.arn AS target_group_origin_arn
                    , asg.auto_scaling_group_name AS target_group_origin_name
            FROM    aws_elbv1_load_balancers AS lb
                    , aws_autoscaling_groups AS asg
                    , UNNEST(load_balancer_names) AS asg_lb_name
            WHERE   lb.load_balancer_name = asg_lb_name
        )
        , ec2_alb_data AS (
            SELECT  alb.account_id
                    , alb.region

                    -- Fallback to ASG tags when the load balancer isn't tagged
                    , COALESCE(
                        ARRAY_TO_STRING(ARRAY[alb.tags ->> 'App', alb.tags ->> 'Stack', alb.tags ->> 'Stage'], '-')
                        , ARRAY_TO_STRING(ARRAY[asg.tags ->> 'App', asg.tags ->> 'Stack', asg.tags ->> 'Stage'], '-')
                      ) AS service_name

                    , 'alb' AS load_balancer_type
                    , alb.arn AS load_balancer_arn
                    , alb.load_balancer_name

                    -- Use ASG tags to support the single load balancer to multiple target groups architecture (i.e. MAPI)
                    , asg.tags ->> 'Stack' AS stack
                    , asg.tags ->> 'Stage' AS stage
                    , asg.tags ->> 'App' AS app
                    , asg.tags ->> 'gu:repo' AS repo
                    , asg.tags ->> 'gu:riff-raff:project' AS riffraff_project

                    , target_group.arn AS target_group_arn
                    , 'asg' AS target_group_origin_type
                    , asg.arn AS target_group_origin_arn
                    , asg.auto_scaling_group_name AS target_group_origin_name
            FROM    aws_elbv2_load_balancers AS alb
                    , aws_elbv2_target_groups AS target_group
                    , UNNEST(target_group.load_balancer_arns) AS tg_lb_arn
                    , aws_autoscaling_groups AS asg
                    , UNNEST(asg.target_group_arns) AS asg_tg_arn
            WHERE   alb.type = 'application'
                    AND alb.arn = tg_lb_arn
                    AND target_group.arn = asg_tg_arn
        )
        , ecs_data AS (
            SELECT  alb.account_id
                    , alb.region
                    , ARRAY_TO_STRING(ARRAY[target_group.tags ->> 'App', target_group.tags ->> 'Stack', target_group.tags ->> 'Stage'], '-') AS service_name

                    , 'alb' AS load_balancer_type
                    , alb.arn AS load_balancer_arn
                    , alb.load_balancer_name

                    , target_group.tags ->> 'Stack' AS stack
                    , target_group.tags ->> 'Stage' AS stage
                    , target_group.tags ->> 'App' AS app
                    , target_group.tags ->> 'gu:repo' AS repo
                    , target_group.tags ->> 'gu:riff-raff:project' AS riffraff_project

                    , target_group.arn AS target_group_arn
                    , 'ecs' AS target_group_origin_type
                    , ecs.arn AS target_group_origin_arn
                    , ecs.service_name AS target_group_origin_name
            FROM    aws_elbv2_load_balancers AS alb
                    , aws_elbv2_target_groups AS target_group
                    , UNNEST(target_group.load_balancer_arns) AS tg_alb_arn
                    , aws_ecs_cluster_services AS ecs
                    , JSONB_ARRAY_ELEMENTS(ecs.load_balancers) as ecs_alb
            WHERE   alb.type = 'application'
                    AND alb.arn = tg_alb_arn
                    AND target_group.arn = ecs_alb ->> 'TargetGroupArn'
        )
        , data AS (
            SELECT  *
            FROM    ec2_clb_data

            UNION ALL

            SELECT  *
            FROM    ec2_alb_data

            UNION ALL

            SELECT  *
            FROM    ecs_data
        )
        SELECT DISTINCT data.account_id
                        , acc.name as account_name
                        , data.region
                        , data.service_name
                        , data.load_balancer_type
                        , data.load_balancer_arn
                        , data.load_balancer_name
                        , data.stack
                        , data.stage
                        , data.app
                        , data.repo
                        , data.riffraff_project
                        , data.target_group_arn
                        , data.target_group_origin_type
                        , data.target_group_origin_arn
                        , data.target_group_origin_name
                        , cw.elk_index
                        , cw.grafana_cloudwatch_datasource
                        , elk.kibana_space
                        , slos.slo
                        , slos.state_value
                        , domain_info.domain_names
        FROM            data
                        JOIN aws_accounts acc ON data.account_id = acc.id
                        LEFT JOIN grafana_cloudwatch_to_internal_infra cw ON data.account_id = cw.aws_account_id
                        LEFT JOIN elk_index_to_space elk ON elk.elk_index = cw.elk_index
                        LEFT JOIN slos ON data.load_balancer_arn = slos.load_balancer_arn
                        LEFT JOIN domain_info ON data.load_balancer_arn = domain_info.load_balancer_arn;
    $$ LANGUAGE SQL;

    CREATE VIEW view_availability_dashboard AS (
        SELECT  *
        FROM    fn_view_availability_dashboard()
    );
COMMIT TRANSACTION;