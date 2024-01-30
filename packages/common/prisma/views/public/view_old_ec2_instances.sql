SELECT
  ac.id AS account_id,
  ac.name AS account_name,
  ec2.instance_id,
  (ec2.state ->> 'Name' :: text) AS state,
  (ec2.tags ->> 'Stack' :: text) AS stack,
  (ec2.tags ->> 'Stage' :: text) AS stage,
  (ec2.tags ->> 'App' :: text) AS app,
  (ec2.tags ->> 'gu:repo' :: text) AS repo,
  ec2.region,
  coalesce_dates(img.creation_date, ec2.launch_time) AS creation_or_launch_time
FROM
  (
    (
      aws_ec2_instances ec2
      LEFT JOIN aws_ec2_images img ON ((ec2.image_id = img.image_id))
    )
    LEFT JOIN aws_accounts ac ON ((ec2.account_id = ac.id))
  )
WHERE
  (
    (
      (
        coalesce_dates(img.creation_date, ec2.launch_time) IS NULL
      )
      OR (
        coalesce_dates(img.creation_date, ec2.launch_time) < (NOW() - '30 days' :: INTERVAL)
      )
    )
    AND ((ec2.state ->> 'Name' :: text) = 'running' :: text)
  );