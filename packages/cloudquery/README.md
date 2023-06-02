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
- A GitHub Personal Access Token (PAT)
- A Snyk token

## Setup

In the project root, run the following, and follow the resulting instructions:

```sh
./packages/cloudquery/script/setup
```

## Running

1. Start Docker
2. Get AWS credentials from Janus (check [cloudquery.yaml](./dev-config/cloudquery.yaml) for the AWS profiles needed)
3. Run:

   ```sh
   npm start --workspace cloudquery
   ```

   OR:

   ```sh
   ./packages/cloudquery/script/start
   ```

   This will start the Docker containers, and CloudQuery will start collecting data.

4. Open Grafana on [http://localhost:3000](http://localhost:3000), and start querying the data
5. To restart on your local machine, delete the container in docker and go back to step 3.

> **Note**
> You can also use other Postgres clients, such as `psql`, or even your IDE!

## Links

- [CloudQuery provided Grafana dashboards](https://github.com/cloudquery/cloudquery/tree/main/plugins/source/aws/dashboards)

## TODO

- Use the same configuration files as PROD?
