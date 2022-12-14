# The Product & Engineering Service Catalogue
A set of APIs cataloging services deployed via AWS CloudFormation, and their related metadata.

In contrast with [Prism](https://github.com/guardian/prism), which collects data from a subset of AWS resources,
Service Catalogue offers a more complete picture of production services, as we may provision a resource that Prism doesn't know about.

## Purpose
The Guardian has hundreds of EC2, lambda, and other services in AWS, each is built from one of thousands of GitHub repositories, by one of many Product & Engineering (P&E) teams.

We want to be able to answer the following questions:

- For P&E teams: 
  - Which services do I own?
  - Which services follow DevX best practice/use tooling?
  - What does each service cost?
  - Which repo do services come from?
  - What is my service reliability? (time since last incident)

- For the Developer Experience stream:
  - What proportion of all services follow best practice/use tooling?
  - What kinds of technologies are different streams using?
  - What services are costing us the most money?
  - Which teams are struggling with reliability and need more support?
  - Which services belong to specific P&E product teams

## How is it done?
The project consists of the following sub-projects:

- [**GitHub Lens API**](packages/github-lens-api/README.md): A simple API to expose the cached GitHub data we have already fetched.
- [**GitHub Data Fetcher**](packages/github-data-fetcher/README.md): A scheduled lambda to retrieve data from GitHub to serve in the Lens API.
- [**GitHub Services API**](packages/services-api/README.md): The service API itself, combining data from the other services in this repository.

## Local Development
1. Get AWS credentials from Janus for the `deployTools` profile
2. Run setup:

   ```sh
   ./scripts/setup.sh
   ```

   Local configuration uses [dotenv](https://www.npmjs.com/package/dotenv), reading the file `.env` at the project root.
   The setup script will download an initial version of this file.

3. Run a service:

   You can run the following commands to start the various services locally:

   ```sh
   # Run github-data-fetcher lambda
   npm run dev-data-fetcher
   
   # Run github-lens-api
   npm run dev-github-lens-api
   
   # Run services-api
   npm run dev-services-api
   ```

### Testing
To run all the tests, `npm run test`. To run tests under a particular path, `npm run test -w <PATH_TO_DIRECTORY>`.

## Known limitations / future improvements
- Manually provisioned resources

  This repository defines a service as something provisioned in AWS defined using Infrastructure as Code (IaC) (AWS CloudFormation).
  Those resources provisioned outside IaC are not reported against. In the future, we should collect this data to help us answer questions such as:
  - How can I completely recreate my service in a different region from scratch?
  
- Multiple repositories

  If a service defines its application code in one repository, and infrastructure in another, 
  the Service Catalogue APIs will _not_ offer an aggregated view.
  It will treat the repositories as independant entities.
  
  The ultimate solution here is for teams to migrate to a single repository, as:
    - Multiple repositories means at least one of them is manually deployed
    - With a single repository, Riff-Raff can be used to continuously deploy all aspects of the service
