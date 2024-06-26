SELECT
  fn_old_ec2_instances.account_id,
  fn_old_ec2_instances.account_name,
  fn_old_ec2_instances.instance_id,
  fn_old_ec2_instances.state,
  fn_old_ec2_instances.stack,
  fn_old_ec2_instances.stage,
  fn_old_ec2_instances.app,
  fn_old_ec2_instances.repo,
  fn_old_ec2_instances.region,
  fn_old_ec2_instances.creation_or_launch_time
FROM
  fn_old_ec2_instances() fn_old_ec2_instances(
    account_id,
    account_name,
    instance_id,
    state,
    stack,
    stage,
    app,
    repo,
    region,
    creation_or_launch_time
  );