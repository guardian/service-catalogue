# Getting Started

## Completeness of CloudQuery data

We are using CloudQuery to collect data about how The Guardian uses:

- AWS
- GitHub
- Fastly
- Galaxies of the Guardian
- Image packages

CloudQuery generally collects metadata about these resources. That means that we have information like the name of a
repository, and when it was created, but not the contents of the files in it.

CloudQuery is only as good as the data we have, and the links between them. If you are following
DevX [best practices](https://github.com/guardian/recommendations/blob/main/best-practices.md) consistently, this
shouldn't be too much of a problem. However, if you are not, you may find that some of the data you are expecting to see
is missing, as we rely heavily on particular pieces of information to make connections between different sources.

To make sure your team's CloudQuery information is as complete as it can be, please complete as many of these steps as
is practical:

#### Everyone

- Your team email and GitHub team ID/slug
  are [up-to-date in Galaxies](https://github.com/guardian/galaxies/blob/main/shared/data/teams.ts)
  - **Link created:** Galaxies &harr; Github
  - **Reason:** We can associate business units with GitHub teams

#### Engineers

- Your repositories are administrated by the GitHub team named in Galaxies
  - **Link created:** Galaxies &harr; Github
  - **Reason:** We can associate repositories with business units
- Using [guardian/cdk](https://github.com/guardian/cdk) to provision your infrastructure
  - **Link created:** AWS &harr; Github
  - **Reason:** Infrastructure stacks created using GuCDK are tagged with the repository that provisioned it.

Some of the CloudQuery scans run less frequently than others. You can see the schedule for each job in the CDK stack, If
you need your information quickly, prod Operations, and we will rerun the jobs on your behalf. You can find our
contact details in CloudQuery!

## Accessing CloudQuery data

We've stored our CloudQuery data in a Postgres database, so you can use SQL to query it. _You don't have to be technical
or an engineer to be able to use SQL_. Its basic syntax is designed to be very intuitive. If you are unfamiliar with
SQL, there are lots of resources online to get you started. Julia Evans has
a [SQL playground](https://sql-playground.wizardzines.com/) to get beginners used to making simple queries.

### Grafana

The easiest way to run queries against the CloudQuery database is via [Grafana](https://metrics.gutools.co.uk/).
You can get started in the Explore tab, as demonstrated below.

![A gif showing how to interact with CloudQuery using the Grafana UI](img/queryVideo.gif)

### Local SQL client

An alternative way to query the database is using a local SQL client. To enable this use case, the database has a
read-only user configured, the credentials for which are available in Secrets Manager at the path
`/PROD/deploy/service-catalogue/devreadonly-postgres-password`.

IntelliJ has a very good SQL client that, together with the AWS plugin, enables connecting to the database using
just regular Janus credentials and the full ARN of `/PROD/deploy/service-catalogue/devreadonly-postgres-password`.

#### DBeaver and other JDBC tools

AWS has a JDBC client that wraps RDS hosted JDBC libraries with a shim
that fetches the config from [Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/retrieving-secrets_jdbc.html), in which one
uses the secret name in place of the database URL and the username. The secret must have a [particular structure](https://docs.aws.amazon.com/secretsmanager/latest/userguide/reference_secret_json_structure.html#reference_secret_json_structure_rds) for this to work - the same structure is used by the database client in IntelliJ IDEA.

To use this in DBeaver, you first need to create a new driver in `Driver Manager`:
| Setting | Value |
|---------|-------|
| Class Name | com.amazonaws.secretsmanager.sql.AWSSecretsManagerPostgreSQLDriver |
|URL Template | jdbc-secretsmanager:postgresql://{host}[:port]/[database]|
| Allow Empty Password | True |

Under Libraries you need to add the Postgres driver and the Secrets Manager wrapper. This is easiest using `Add Artifact` which allows you to paste in the XML directly. The XML can be copied from Maven.

[Maven: AWS Secrets Manager SQL Connection Library](https://mvnrepository.com/artifact/com.amazonaws.secretsmanager/aws-secretsmanager-jdbc)

```xml
<dependency>
    <groupId>com.amazonaws.secretsmanager</groupId>
    <artifactId>aws-secretsmanager-jdbc</artifactId>
    <version>2.1.3</version> <!-- please use latest version! -->
    <scope>compile</scope>
</dependency>
```

and  
[<Maven: PostgreSQL JDBC Driver](https://mvnrepository.com/artifact/org.postgresql/postgresql)

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.13</version> <!-- please use latest version! -->
    <scope>compile</scope>
</dependency>
```

When creating a new connection in DBeaver: select "Connect by URL", then enter the Secret Name for the URL and also for the username - leaving the password blank. If it tries to access a database named after the user (eg `devreadonly`) then the `dbname` parameter is missing from the secret and needs to be added with the value `postgres`.

**AWS Credentials** To talk to Secrets Manager, AWS Credentials must be set in a terminal from Janus! At the moment it seems that they must be set in the `default` profile.

### Tips for writing queries

If you're unsure of where to start, we have
an [example dashboard](https://metrics.gutools.co.uk/d/KpxfmalVz/devx-cloudquery-okr-dashboard?orgId=1&refresh=1d)
answering some common questions such as:

- What production status does a repository have
- Does the repository my stack lives in have security monitoring?
- Who owns service XYZ?

Generally, the link between one piece of information and another is via the repository. For example, if you want to know
which team owns a particular domain, you can run a query like this:

```sql
--example row: 'guardian/repo1', 'the-best-team' , 'The Best Team'
WITH repo_owners AS (SELECT github_team_repositories.full_name as repo_name
                          , github_teams.name                  as team_name
                          , github_teams.slug
                     FROM github_team_repositories
                              JOIN github_teams ON github_teams.id = github_team_repositories.team_id
                     WHERE github_team_repositories.role_name = 'admin')

--example row: 'api.example.com', 'The Best Team'
SELECT certs.domain_name
     , team_name
FROM aws_acm_certificates certs
         JOIN repo_owners ON repo_owners.repo_name = certs.tags ->>'gu:repo'

```

This query links the URL of a service to the team that owns the repository that created it. Here the key join is the
final line: `repo_owners.repo_name=certs.tags ->>'gu:repo'` which joins the repository associated with a team to the
repository associated with a stack. It allows us to generate a table of domain owners like this:

| domain_name     | team_name   |
| --------------- | ----------- |
| api.example.com | Team Edward |
| example.com     | Team Jacob  |
| example.net     | Team Rocket |
