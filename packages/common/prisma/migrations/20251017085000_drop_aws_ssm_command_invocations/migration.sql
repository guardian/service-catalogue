BEGIN TRANSACTION;
    DELETE FROM cloudquery_table_frequency WHERE table_name = 'aws_ssm_command_invocations';
    DROP TABLE IF EXISTS aws_ssm_command_invocations;
COMMIT;