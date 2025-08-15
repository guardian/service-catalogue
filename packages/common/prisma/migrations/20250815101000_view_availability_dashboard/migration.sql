-- @formatter:off -- this stops IntelliJ from reformatting the SQL
begin transaction;
    drop view if exists view_availability_dashboard;
    drop function if exists fn_view_availability_dashboard;;

    create function fn_view_availability_dashboard() returns table (
        account_id text
        , account_name text
        , region text
        , service_name text
        , load_balancer_type text
        , load_balancer_arn text
        , load_balancer_name text
        , stack text
        , stage text
        , app text
        , repo text
        , riffraff_project text
        , auto_scaling_group_arn text
        , auto_scaling_group_name text
        , elk_index text
        , grafana_cloudwatch_datasource text
        , kibana_space text
        , slo text
        , state_value text
        , domain_name text
    ) as $$
        with slos as (
            select  format('arn:aws:elasticloadbalancing:%1$s:%2$s:loadbalancer/%3$s', region, account_id, load_balancer_identifier) as load_balancer_arn
                    , state_value
                    , 1 - threshold  as slo
            from    aws_cloudwatch_alarms
                    , COALESCE(
                        metrics->-1#>'{MetricStat,Metric,Dimensions}'->0#>'{Value}'#>>'{}'
                        , metrics->1#>'{MetricStat,Metric,Dimensions}'->0#>'{Value}'#>>'{}'
                    ) as load_balancer_identifier
            where   alarm_name like 'child-alarm-short-period-Slow%'
        )
        , acm_certificates as (
            -- TODO also include values from fastly_service_backends and ns1_records?
            select  arn
                    , domain_name
                    , unnest(in_use_by) as load_balancer_arn
            from    aws_acm_certificates
        )
        , data as (
            select  lb.account_id
                    , lb.region
                    , array_to_string(ARRAY[lb.tags ->>'App', lb.tags ->>'Stack', lb.tags ->>'Stage'], '-') as service_name
                    , 'clb' as load_balancer_type
                    , lb.arn as load_balancer_arn
                    , lb.load_balancer_name
                    , asg.tags ->> 'Stack' as stack
                    , asg.tags ->> 'Stage' as stage
                    , asg.tags ->> 'App' as app
                    , asg.tags ->> 'gu:riff-raff:project' as riffraff_project
                    , asg.tags ->> 'gu:repo' as repo

                    , asg.auto_scaling_group_name
                    , asg.arn as auto_scaling_group_arn
            from    aws_elbv1_load_balancers as lb
                    , aws_autoscaling_groups as asg
                    , unnest(load_balancer_names) as asg_lb_name
            where   lb.load_balancer_name = asg_lb_name

            union all

            select  lb.account_id
                    , lb.region
                    , array_to_string(ARRAY[lb.tags ->>'App', lb.tags ->>'Stack', lb.tags ->>'Stage'], '-') as service_name
                    , 'alb' as load_balancer_type
                    , lb.arn as load_balancer_arn
                    , lb.load_balancer_name

                    -- Use ASG tags to support the single load balancer to multiple target groups architecture (i.e. MAPI)
                    , asg.tags ->> 'Stack' as stack
                    , asg.tags ->> 'Stage' as stage
                    , asg.tags ->> 'App' as app
                    , asg.tags ->> 'gu:riff-raff:project' as riffraff_project
                    , asg.tags ->> 'gu:repo' as repo

                    , asg.auto_scaling_group_name
                    , asg.arn as auto_scaling_group_arn
            from    aws_elbv2_load_balancers as lb
                    , aws_elbv2_target_groups as tg
                    , unnest(tg.load_balancer_arns) as tg_lb_arn
                    , aws_autoscaling_groups as asg
                    , unnest(asg.target_group_arns) as asg_tg_arn
            where   lb.arn = tg_lb_arn
                    and tg.arn = asg_tg_arn
        )

        select  data.account_id
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
                , data.auto_scaling_group_arn
                , data.auto_scaling_group_name
                , cw.elk_index
                , cw.grafana_cloudwatch_datasource
                , elk.kibana_space
                , slos.slo
                , slos.state_value
                , acm_certificates.domain_name
        from    data
                join aws_accounts acc on data.account_id = acc.id
                left join grafana_cloudwatch_to_internal_infra cw on data.account_id = cw.aws_account_id
                left join elk_index_to_space elk on elk.elk_index = cw.elk_index
                left join slos on data.load_balancer_arn = slos.load_balancer_arn
                left join acm_certificates on data.load_balancer_arn = acm_certificates.load_balancer_arn;
    $$ language sql;

    create view view_availability_dashboard as (
        select  *
        from    fn_view_availability_dashboard()
    );
commit transaction;