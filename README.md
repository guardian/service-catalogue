# GitHub Lens
_A lens into your GitHub organisations_, GitHub Lens provides a cached snapshot of your GitHub organisation repositories
and teams via a simple API.

The project consists of the following subprojects:

- **API**: A simple API to expose the cached GitHub data we have already fetched.

- **Repo Fetcher**: A fetcher for repository metadata

## Local Development

If this your first time developing github-lens, you should run:

```
./scripts/setup.sh
```

Local configuration uses [dotenv](https://www.npmjs.com/package/dotenv). This means you should have a `.env` file 
at the root of the project and add the necessary environment variables (or otherwise configure them in your environment.) 
The setup script will download a starter `.env`.

### Running locally

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
