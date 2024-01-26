/*
 The view view_old_ec2_instances
 */
CREATE OR REPLACE FUNCTION coalesce_dates(image_creation_time timestamp, instance_launch_time timestamp) RETURNS date
    LANGUAGE SQL
    IMMUTABLE
RETURN coalesce(cast(image_creation_time as date), cast(instance_launch_time as date));

create or replace view view_old_ec2_instances as
select ac.id                                              as account_id
     , ac.name                                            as account_name
     , ec2.instance_id
     , ec2.state ->> 'Name'                               as state
     , ec2.tags ->> 'Stack'                               as stack
     , ec2.tags ->> 'Stage'                               as stage
     , ec2.tags ->> 'App'                                 as app
     , ec2.tags ->> 'gu:repo'                             as repo
     , ec2.region
     , coalesce_dates(img.creation_date, ec2.launch_time) as creation_or_launch_time
from aws_ec2_instances ec2
         left join aws_ec2_images img on ec2.image_id = img.image_id
         left join aws_accounts ac on ec2.account_id = ac.id
where (
        coalesce_dates(img.creation_date, ec2.launch_time) is null
        or coalesce_dates(img.creation_date, ec2.launch_time) < NOW() - INTERVAL '30 days'
    )
  and ec2.state ->> 'Name' = 'running';
