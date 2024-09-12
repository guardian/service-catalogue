## Dependency graph integrator

### Context

#### Why track dependencies?

The supply chain is an increasingly common attack vector for malicious actors. Tracking the dependencies we use - and resolving the vulnerabilities they introduce - allows us to minimise the probability of such an attack occurring, and the reduces the impact of such an attack.

#### Why do we need this tool?

Dependency management is a complex problem, and no tool is a complete solution. Dependabot (GitHub's in-house dependency management tool) works well for some languages, but not all. Crucially for P&E, Dependabot does not support scanning build.sbt files, and some Kotlin configurations. This tool attempts to solve that problem.

An automated solution saves teams time and effort expended into understanding how to configure the action, and means repos are integrated with Dependabot more quickly, and with fewer mistakes.

### What does it do?

The dependency graph integrator takes a repo name as JSON, like so:

```json
{
	"name": "service-catalogue",
	"language": "Scala"
}
```

It uses this input to generates a workflow file that allows us to submit sbt dependencies to GitHub for vulnerability monitoring, via GitHub Action.

For a Scala repo, the file will look something like this

```yaml
name: Update Dependency Graph
on:
  push:
    branches:
      - main # default branch of the project
jobs:
  dependency-graph:
    name: Update Dependency Graph
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@long-sha-here # va.b.c
      - uses: scalacenter/sbt-dependency-submission@another-long-sha # vx.y.z
    permissions:
      contents: write # this permission is needed to submit the dependency graph
```

After creating the YAML file, it raises a pull request on the named repository for teams to review.

### Running on non-production environments

In non-production environments, such as CODE, or when running locally, the dependency graph integrator will not create a PR. Instead, it will print the contents of the YAML file to the console. This allows developers to test the the core logic (creating the yaml file), without unintended side effects.

#### CODE

The lambda can safely be invoked in the CODE environment, as it will only attempt to create a PR if the `STAGE` environment variable is set to `PROD`. Additionally, there are no GitHub credentials available to the CODE lambda - any attempt to instantiate a GitHub client will fail.

The format of input to the lambda on the CODE environment is that of an SNS message. It's not trivial to construct, so some sample events have been provided in the Test tab of the lambda in the AWS console.

#### DEV

The lambda can be invoked locally by running `npm run start -w dependency-graph-integrator` from the root of the repo, or `npm run start` from the root of the snyk-integrator package. The input can be configured by modifying [this file](./src/run-locally.ts)
