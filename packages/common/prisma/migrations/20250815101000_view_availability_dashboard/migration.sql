-- @formatter:off -- this stops IntelliJ from reformatting the SQL
BEGIN TRANSACTION;
    CREATE TABLE IF NOT EXISTS aws_autoscaling_groups (
        _cq_sync_time TIMESTAMP(6)
        , _cq_source_name TEXT
        , _cq_id UUID NOT NULL
        , _cq_parent_id UUID
        , account_id TEXT
        , region TEXT
        , load_balancers JSONB
        , load_balancer_target_groups JSONB
        , arn TEXT
        , tags JSONB
        , tags_raw JSONB
        , auto_scaling_group_name TEXT
        , availability_zones TEXT[]
        , created_time TIMESTAMP(6)
        , default_cooldown BIGINT
        , desired_capacity BIGINT
        , health_check_type TEXT
        , max_size BIGINT
        , min_size BIGINT
        , auto_scaling_group_arn TEXT
        , capacity_rebalance BOOLEAN
        , context TEXT
        , default_instance_warmup BIGINT
        , desired_capacity_type TEXT
        , enabled_metrics JSONB
        , health_check_grace_period BIGINT
        , instance_maintenance_policy JSONB
        , instances JSONB
        , launch_configuration_name TEXT
        , launch_template JSONB
        , load_balancer_names TEXT[]
        , max_instance_lifetime BIGINT
        , mixed_instances_policy JSONB
        , new_instances_protected_from_scale_in BOOLEAN
        , placement_group TEXT
        , predicted_capacity BIGINT
        , service_linked_role_arn TEXT
        , status TEXT
        , suspended_processes JSONB
        , target_group_arns TEXT[]
        , termination_policies TEXT[]
        , traffic_sources JSONB
        , vpc_zone_identifier TEXT
        , warm_pool_configuration JSONB
        , warm_pool_size BIGINT
        , notification_configurations JSONB

        , CONSTRAINT aws_autoscaling_groups_cqpk PRIMARY KEY (_cq_id)
    );

    CREATE TABLE IF NOT EXISTS aws_cloudwatch_alarms (
        _cq_sync_time TIMESTAMP(6)
        , _cq_source_name TEXT
        , _cq_id UUID NOT NULL
        , _cq_parent_id UUID
        , account_id TEXT
        , region TEXT
        , tags JSONB
        , arn TEXT
        , dimensions JSONB
        , actions_enabled BOOLEAN
        , alarm_actions TEXT[]
        , alarm_arn TEXT
        , alarm_configuration_updated_timestamp TIMESTAMP(6)
        , alarm_description TEXT
        , alarm_name TEXT
        , comparison_operator TEXT
        , datapoints_to_alarm BIGINT
        , evaluate_low_sample_count_percentile TEXT
        , evaluation_periods BIGINT
        , evaluation_state TEXT
        , extended_statistic TEXT
        , insufficient_data_actions TEXT[]
        , metric_name TEXT
        , metrics JSONB
        , namespace TEXT
        , ok_actions TEXT[]
        , period BIGINT
        , state_reason TEXT
        , state_reason_data TEXT
        , state_transitioned_timestamp TIMESTAMP(6)
        , state_updated_timestamp TIMESTAMP(6)
        , state_value TEXT
        , statistic TEXT
        , threshold DOUBLE PRECISION
        , threshold_metric_id TEXT
        , treat_missing_data TEXT
        , unit TEXT

        , CONSTRAINT aws_cloudwatch_alarms_cqpk PRIMARY KEY (_cq_id)
    );

    CREATE TABLE IF NOT EXISTS aws_elbv2_target_groups (
        _cq_sync_time TIMESTAMP(6)
        , _cq_source_name TEXT
        , _cq_id UUID NOT NULL
        , _cq_parent_id UUID
        , account_id TEXT
        , region TEXT
        , tags JSONB
        , arn TEXT
        , health_check_enabled BOOLEAN
        , health_check_interval_seconds BIGINT
        , health_check_path TEXT
        , health_check_port TEXT
        , health_check_protocol TEXT
        , health_check_timeout_seconds BIGINT
        , healthy_threshold_count BIGINT
        , ip_address_type TEXT
        , load_balancer_arns TEXT[]
        , matcher JSONB
        , port BIGINT
        , protocol TEXT
        , protocol_version TEXT
        , target_group_arn TEXT
        , target_group_name TEXT
        , target_type TEXT
        , unhealthy_threshold_count BIGINT
        , vpc_id TEXT

        , CONSTRAINT aws_elbv2_target_groups_cqpk PRIMARY KEY (_cq_id)
    );

    -- These views are currently manually managed.
    DO
    $do$
        BEGIN
            -- PSQL does not have a CREATE VIEW IF NOT EXISTS capability, this is a workaround.
            IF NOT EXISTS (SELECT table_name FROM INFORMATION_SCHEMA.views WHERE table_name = 'elk_index_to_space') THEN
                CREATE VIEW elk_index_to_space(
                    elk_index
                    , kibana_space
                ) AS
                    SELECT  '???'
                            , '???';
            END IF;

            -- PSQL does not have a CREATE VIEW IF NOT EXISTS capability, this is a workaround.
            IF NOT EXISTS (SELECT table_name FROM INFORMATION_SCHEMA.views WHERE table_name = 'grafana_cloudwatch_to_internal_infra') THEN
                CREATE VIEW grafana_cloudwatch_to_internal_infra(
                     grafana_cloudwatch_datasource
                    , elk_index
                    , aws_account_id
                    ) AS
                SELECT '???'
                     , '???'
                     , '???';
            END IF;
        END
    $do$;

    CREATE FUNCTION fn_view_availability_dashboard() RETURNS TABLE (
        account_id TEXT
        , account_name TEXT
        , region TEXT
        , service_name TEXT
        , load_balancer_type TEXT
        , load_balancer_arn TEXT
        , load_balancer_name TEXT
        , stack TEXT
        , stage TEXT
        , app TEXT
        , repo TEXT
        , riffraff_project TEXT
        , auto_scaling_group_arn TEXT
        , auto_scaling_group_name TEXT
        , elk_index TEXT
        , grafana_cloudwatch_datasource TEXT
        , kibana_space TEXT
        , slo TEXT
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
        , data AS (
            SELECT  lb.account_id
                    , lb.region
                    , COALESCE(
                        -- Fallback to ASG tags when the load balancer isn't tagged
                        ARRAY_TO_STRING(
                            ARRAY[
                                lb.tags ->> 'App'
                                , lb.tags ->> 'Stack'
                                , lb.tags ->> 'Stage'
                            ]
                            , '-'
                        )
                        , ARRAY_TO_STRING(
                            ARRAY[
                                asg.tags ->> 'App'
                                , asg.tags ->> 'Stack'
                                , asg.tags ->> 'Stage'
                            ]
                            , '-'
                        )
                      ) AS service_name
                    , 'clb' AS load_balancer_type
                    , lb.arn AS load_balancer_arn
                    , lb.load_balancer_name
                    , asg.tags ->> 'Stack' AS stack
                    , asg.tags ->> 'Stage' AS stage
                    , asg.tags ->> 'App' AS app
                    , asg.tags ->> 'gu:riff-raff:project' AS riffraff_project
                    , asg.tags ->> 'gu:repo' AS repo

                    , asg.auto_scaling_group_name
                    , asg.arn AS auto_scaling_group_arn
            FROM    aws_elbv1_load_balancers AS lb
                    , aws_autoscaling_groups AS asg
                    , UNNEST(load_balancer_names) AS asg_lb_name
            WHERE   lb.load_balancer_name = asg_lb_name

            UNION ALL

            SELECT  lb.account_id
                    , lb.region
                    , COALESCE(
                        -- Fallback to ASG tags when the load balancer isn't tagged
                        ARRAY_TO_STRING(
                            ARRAY[
                                lb.tags ->> 'App'
                                , lb.tags ->> 'Stack'
                                , lb.tags ->> 'Stage'
                            ]
                            , '-'
                        )
                        , ARRAY_TO_STRING(
                            ARRAY[
                                asg.tags ->> 'App'
                                , asg.tags ->> 'Stack'
                                , asg.tags ->> 'Stage'
                            ]
                            , '-'
                        )
                      ) AS service_name
                    , 'alb' AS load_balancer_type
                    , lb.arn AS load_balancer_arn
                    , lb.load_balancer_name

                    -- Use ASG tags to support the single load balancer to multiple target groups architecture (i.e. MAPI)
                    , asg.tags ->> 'Stack' AS stack
                    , asg.tags ->> 'Stage' AS stage
                    , asg.tags ->> 'App' AS app
                    , asg.tags ->> 'gu:riff-raff:project' AS riffraff_project
                    , asg.tags ->> 'gu:repo' AS repo

                    , asg.auto_scaling_group_name
                    , asg.arn AS auto_scaling_group_arn
            FROM    aws_elbv2_load_balancers AS lb
                    , aws_elbv2_target_groups AS tg
                    , UNNEST(tg.load_balancer_arns) AS tg_lb_arn
                    , aws_autoscaling_groups AS asg
                    , UNNEST(asg.target_group_arns) AS asg_tg_arn
            WHERE   lb.arn = tg_lb_arn
                    AND tg.arn = asg_tg_arn
        )

        SELECT DISTINCT data.account_id
                , acc.name AS account_name
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
                , data.auto_scaling_group_arn
                , data.auto_scaling_group_name
                , cw.elk_index
                , cw.grafana_cloudwatch_datasource
                , elk.kibana_space
                , slos.slo
                , slos.state_value
                , domain_info.domain_names
        FROM    data
                JOIN aws_accounts acc ON data.account_id = acc.id
                LEFT JOIN grafana_cloudwatch_to_internal_infra cw ON data.account_id = cw.aws_account_id
                LEFT JOIN elk_index_to_space elk ON elk.elk_index = cw.elk_index
                LEFT JOIN slos ON data.load_balancer_arn = slos.load_balancer_arn
                LEFT JOIN domain_info ON data.load_balancer_arn = domain_info.load_balancer_arn;
    $$ LANGUAGE sql;

    CREATE VIEW view_availability_dashboard AS (
        SELECT  *
        FROM    fn_view_availability_dashboard()
    );
COMMIT TRANSACTION;