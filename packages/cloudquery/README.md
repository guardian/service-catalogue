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

## Running
1. Get AWS credentials from Janus (check [cloudquery.yaml](./dev-config/cloudquery.yaml) for the AWS profiles needed)
2. Run:
   
   ```sh
   npm start --workspace cloudquery
   ```
   
   This will start the Docker containers, and CloudQuery will start collecting data.
3. Open Grafana on [http://localhost:3000](http://localhost:3000), and start querying the data

> **Note**
> You can also use other Postgres clients, such as `psql`, or even your IDE!

## Links
- [CloudQuery provided Grafana dashboards](https://github.com/cloudquery/cloudquery/tree/main/plugins/source/aws/dashboards)

## TODO
- Use the same configuration files as PROD?
