/*
The view view_running_instances provides general information about running EC2 instances
| account_name |  app |  image_id  | instance_id | built_by_amigo | launch_time|
|--------------|------|------------|-------------|----------------|------------|
|    account1  | grid | ami-123456 |  i-1234556  |      true      | 2023-06-23 |
 */
create or replace view view_running_instances as
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

                                           instances.image_id,
                                           instances.instance_id,
                                           CASE
                                               WHEN images.built_by_amigo THEN true
                                               ELSE false
                                               END                  as built_by_amigo,
                                           cast(instances.launch_time as date)
from aws_ec2_instances instances
         left join aggregated_images images
                   on instances.image_id = images.image_id -- instances.account_id=images.account_id
         left join aws_organizations_accounts accts on instances.account_id = accts.id
where instances.state ->> 'Name' = 'running'
order by instances.instance_id, built_by_amigo desc;
