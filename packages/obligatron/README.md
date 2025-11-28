# Obligatron

A lambda which evaluates data from Service Catalogue and generates an Obligation report.

## Running Locally

1. Start the Dev database with `npm -w dev-environment run start`
2. Run the Lambda and specific an obligation with `npm -w obligatron run start -- (Obligation Name)`
   - For example to run the tagging obligation you would run  `npm -w obligatron run start -- AWS_VULNERABILITIES`. You can find a list of obligations [here](./src/index.ts)