# GitHub Lens
_A lens into your GitHub organisations_, GitHub Lens provides a cached snapshot of your GitHub organisation repositories
and teams via a simple API.

The project consists of the following subprojects:

- **API**: A simple API to expose the cached GitHub data we have already fetched.

- **Repo Fetcher**: A fetcher for repository metadata

- **Teams Fetcher**: A fetcher for teams metadata

## Local Development

If this your first time developing github-lens, you should run:

```
./scripts/setup.sh
```

Local configuration uses [dotenv](https://www.npmjs.com/package/dotenv). This means you should have a `.env` file 
at the root of the project and add the necessary environment variables (or otherwise configure them in your environment.) 
The setup script will download a starter `.env`.

### Running locally

The project uses npm workspaces, and individual workspaces should have a `dev` script that can be run to execute 

To fetch the data you need to run
```
npm -w packages/repo-fetcher run dev
```

This will start the api on localhost:3232
```
npm -w packages/github-lens-api run dev
```

### Testing

To run all the tests, `npm run test`. To run tests under a particular path, `npm run test -w <PATH_TO_DIRECTORY>`.