/*
 The view below is used to to indentify the instance types of all running EC2 instances in the environment.
 Providing account name, instance type, app name, instance id, and launch time.
 */
DROP VIEW IF EXISTS view_running_instances;
create view view_running_instances as
with id_and_tags as (select image_id, tags ->> 'BuiltBy' as built_by
                     from aws_ec2_images
                     where tags is not null
                     order by image_id),

     aggregated_images as (select image_id,
                                  CASE
                                      WHEN 'amigo' = ANY (array_agg(built_by)) THEN true
                                      ELSE false
                                      END as built_by_amigo
                           from id_and_tags
                           group by image_id, built_by
                           order by image_id)

select distinct on (instances.instance_id) accts.name               as account_name,
                                           instances.tags ->> 'App' as app,
                                           instances.tags ->> 'Stack' as stack,
                                           instances.tags ->> 'Stage' as stage,
                                           instances.image_id,
                                           instances.instance_id,
                                           CASE
                                               WHEN images.built_by_amigo THEN true
                                               ELSE false
                                               END                  as built_by_amigo,
                                           instances.launch_time,
                                           instances.instance_type as type
from aws_ec2_instances instances
         left join aggregated_images images
                   on instances.image_id = images.image_id -- instances.account_id=images.account_id
         left join aws_organizations_accounts accts on instances.account_id = accts.id
where instances.state ->> 'Name' = 'running'
order by instances.instance_id, built_by_amigo desc;
