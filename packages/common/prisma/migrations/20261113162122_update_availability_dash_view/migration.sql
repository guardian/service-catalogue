begin transaction;
    drop view if exists view_availability_dashboard;
    drop function if exists fn_view_availability_dashboard;

    CREATE TABLE IF NOT EXISTS aws_cloudwatch_metric_alarms (
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
        , action_configuration JSONB

        , CONSTRAINT aws_cloudwatch_metric_alarms_cqpk PRIMARY KEY (_cq_id)
    );

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
            FROM    aws_cloudwatch_metric_alarms
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
commit transaction;

