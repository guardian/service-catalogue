/*
 The view below is used to to indentify the instance types of all running EC2 instances in the environment.
 Providing account name, instance type, app name, instance id, and launch time.
 */
create or replace view view_ec2_instance_types as
SELECT *
FROM (
         SELECT DISTINCT ON (instances.instance_id)
             accts.name               as account_name,
             instances.instance_type as type,
             instances.tags ->> 'App' as app,
             instances.instance_id   as instance_id,
             instances.launch_time as launch_time
         FROM aws_ec2_instances instances
                  LEFT JOIN aws_organizations_accounts accts ON instances.account_id = accts.id
         WHERE instances.state ->> 'Name' = 'running'
         ORDER BY instances.instance_id) distinct_instances
ORDER BY account_name, type, app