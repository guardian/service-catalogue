> **Warning**
> This is for local development only, and deliberately removes authentication for ease.

# CloudQuery

A small project for running [CloudQuery](https://www.cloudquery.io/) locally, using Docker.

It includes:

- CloudQuery
- Postgres
- Grafana

## Requirements

- Docker

## Setup

1. Get deployTools credentials from Janus. Dev level access is required.
2. In the project root, run the following, and follow the resulting instructions:

```sh
./scripts/setup.sh
```

## Running

1. Start Docker
2. Run:

   ```sh
   npm start -w dev-environment
   ```

   OR:

   ```sh
   ./packages/dev-environment/script/start
   ```

   This will start the Docker containers, and CloudQuery will start collecting data.

3. Wait for tables to start being populated. Usually the first tables show up after a few seconds, but this could take
   as long as a minute.
4. Open Grafana on [http://localhost:3000](http://localhost:3000), and start querying the data
5. To restart on your local machine, delete the container in docker and go back to step 2.

> **Note**
> You can also use other Postgres clients, such as `psql` to query the data, or even your IDE!

## Testing the prima migration container

To test the prisma migration container you can run the following script:

```sh
 ./packages/dev-environment/script/start-prisma-migrate-test
```

This will run the run-prisma-migrate.sh script.

## RepoCop

To develop locally once the tables have been populated follow the steps in the repocop [README](../repocop/README.md)

## Links

- [CloudQuery provided Grafana dashboards](https://github.com/cloudquery/cloudquery/tree/main/plugins/source/aws/dashboards)

## Tips and tricks

The local instance of cloudquery executes sequentially according to the order of the plugins in the config file.

If cloudquery can't detect credentials for GitHub, it will skip those jobs. If you're not interested in GitHub
data, you don't need to generate a token. It will still collect data from other sources.

## TODO

- Use the same configuration files as PROD?
