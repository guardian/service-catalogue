# The Guardian Product & Engineering Service Catalogue

A web service that provides an overview of (AWS) services and related metadata. Unlike Prism, this will primarily be targeted at humans rather than machines and Cloudformation stacks will be used as the 'service' unit.

## Purpose

The Guardian has hundreds of EC2, lambda, and other services in AWS, each is built from one of thousands of GitHub repositories, by one of many Product and engineering teams.

We want to be able to answer the following questions:

- For Product & Engineering teams:
  - Which services do I own?
  - Which services follow DevX best practice/use tooling?
  - What does each service cost?
  - Which repo do services come from?
  - What is my service reliability? (time since last incident)

- For the Developer Experience team:
  - What proportion of all services follow best practice/use tooling?
  - What kinds of technologies are different streams using?
  - What services are costing us the most money?
  - Which teams are struggling with reliability and need more support?
  - Which services belong to specific P+E product teams

The project consists of the following sub-projects:

- [**GitHub Lens API**](packages/github-lens-api/README.md): A simple API to expose the cached GitHub data we have already fetched.
- [**GitHub Data Fetcher**](packages/github-data-fetcher/README.md): A scheduled lambda to retrieve data from GitHub to serve in the Lens API.
- [**GitHub Services API**](packages/services-api/README.md): The service API itself, combining data from the other services in this repository.

## Local Development

If this your first time developing github-lens, you should run:

```
./scripts/setup.sh
```

Local configuration uses [dotenv](https://www.npmjs.com/package/dotenv). This means you should have a `.env` file 
at the root of the project and add the necessary environment variables (or otherwise configure them in your environment.) 
The setup script will download a starter `.env`.

You will need to get credentials for the `deployTools` account from janus.

You can run the following commands to start the various services locally:

```
# Run github-data-fetcher lambda
npm run dev-github-data-fetcher

# Run github-lens-api
npm run dev-github-lens-api

# Run services-api
npm run dev-services-api
```

### Testing

To run all the tests, `npm run test`. To run tests under a particular path, `npm run test -w <PATH_TO_DIRECTORY>`.
