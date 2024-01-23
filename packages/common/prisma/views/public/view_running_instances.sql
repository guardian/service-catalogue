WITH id_and_tags AS (
  SELECT
    aws_ec2_images.image_id,
    (aws_ec2_images.tags ->> 'BuiltBy' :: text) AS built_by
  FROM
    aws_ec2_images
  WHERE
    (aws_ec2_images.tags IS NOT NULL)
  ORDER BY
    aws_ec2_images.image_id
),
aggregated_images AS (
  SELECT
    id_and_tags.image_id,
    CASE
      WHEN (
        'amigo' :: text = ANY (array_agg(id_and_tags.built_by))
      ) THEN TRUE
      ELSE false
    END AS built_by_amigo
  FROM
    id_and_tags
  GROUP BY
    id_and_tags.image_id,
    id_and_tags.built_by
  ORDER BY
    id_and_tags.image_id
)
SELECT
  DISTINCT ON (instances.instance_id) accts.name AS account_name,
  (instances.tags ->> 'App' :: text) AS app,
  (instances.tags ->> 'Stack' :: text) AS stack,
  (instances.tags ->> 'Stage' :: text) AS stage,
  instances.image_id,
  instances.instance_id,
  CASE
    WHEN images.built_by_amigo THEN TRUE
    ELSE false
  END AS built_by_amigo,
  instances.launch_time,
  instances.instance_type AS TYPE
FROM
  (
    (
      aws_ec2_instances instances
      LEFT JOIN aggregated_images images ON ((instances.image_id = images.image_id))
    )
    LEFT JOIN aws_organizations_accounts accts ON ((instances.account_id = accts.id))
  )
WHERE
  (
    (instances.state ->> 'Name' :: text) = 'running' :: text
  )
ORDER BY
  instances.instance_id,
  CASE
    WHEN images.built_by_amigo THEN TRUE
    ELSE false
  END DESC;