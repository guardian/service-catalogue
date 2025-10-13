BEGIN TRANSACTION;
    DROP TABLE IF EXISTS aws_alpha_cloudwatch_metric_statistics;
    DROP TABLE IF EXISTS aws_alpha_cloudwatch_metrics;
    DROP TABLE IF EXISTS aws_alpha_costexplorer_cost_custom;
    DROP TABLE IF EXISTS aws_redshift_endpoint_access;
    DROP TABLE IF EXISTS aws_redshift_endpoint_authorization;
COMMIT;