WITH slos(LoadBalancerIdentifier, state_value, slo) AS (
    SELECT
        CONCAT(dimensions->>'LoadBalancerName', '', dimensions->>'LoadBalancer', '', COALESCE(metrics->-1#>'{MetricStat,Metric,Dimensions}'->0#>'{Value}'#>>'{}',metrics->1#>'{MetricStat,Metric,Dimensions}'->0#>'{Value}'#>>'{}')) as LoadBalancerIdentifier,
        state_value,
        1 - threshold as slo
    from aws_cloudwatch_alarms as alarms
    WHERE
        alarm_name like 'child-alarm-short-period-Slow%'
)

SELECT
    'v1' as type,
    (lb1.tags->>'App') as App,
    (lb1.tags->>'Stack') as Stack,
    (lb1.tags->>'Stage') as Stage,
    COALESCE(CAST(slo*100 AS TEXT), 'none') AS SLO,
    lb1.load_balancer_name as id,
    lower(regexp_replace('${AWSAccount:text}', '([A-Z])','-\1', 'g')) as account
FROM
    aws_elbv1_load_balancers lb1
        LEFT JOIN slos on lb1.load_balancer_name = slos.LoadBalancerIdentifier
WHERE
    lb1.load_balancer_name = '${Service}'
-- lb1.load_balancer_name = 'Teamcity-ASG-ELB-1U2XXJ17ZXTD7'

UNION ALL

SELECT
    'v2' as type,
    (lb2.tags->>'App') as App,
    (lb2.tags->>'Stack') as Stack,
    (lb2.tags->>'Stage') as Stage,
    COALESCE(CAST(slo*100 AS TEXT), 'none') AS SLO,
    substring(lb2.arn, 66) as id,
    lower(regexp_replace('${AWSAccount:text}', '([A-Z])','-\1', 'g')) as account
FROM
    aws_elbv2_load_balancers lb2
        LEFT JOIN slos on substring(lb2.arn, 66) = slos.LoadBalancerIdentifier
WHERE
    substring(lb2.arn, 66) = '${Service}'
-- substring(lb2.arn, 66) = 'app/amigo-LoadB-11WFX4UBTS55I/1d8c95028cb9cc83'
