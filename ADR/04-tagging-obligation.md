# Tagging Obligation

## Status
Removed.

## Context
There is an obligation to correctly tag AWS resources. 
Resources that support tagging, should include tags that (at least) adhere to the [tagging schema](https://docs.google.com/spreadsheets/d/1x2OHBanPwdtLmQBj4bhUQYyNCrA3AnrBpOXc1y4xSQw/edit#gid=0)(WIP).

To understand adherence to the obligation, we need a solution to:
1. Understand what resources are taggable
2. For taggable resources, list which tags have been applied

Today, across 39 AWS accounts, there are over 170,000 deployed resources, with 130,000 being taggable.

## Positions
### 1. [AWS Config](https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html)
AWS Config supports the creation of [custom rules](https://docs.aws.amazon.com/config/latest/developerguide/evaluate-config_develop-rules.html) executing custom logic. 
AWS Config rules can be [executed](https://docs.aws.amazon.com/config/latest/developerguide/config-concepts.html#aws-config-rules) in two ways:
- On a schedule
- Or when a change/update is detected

In this implementation, we would have a rule per tagging requirement.
The rule would be a lambda, deployable via Riff-Raff.

We'd likely then query the results within Service Catalogue, once a CloudQuery sync has completed.

#### Advantages
- AWS Config, by default, retains results for 7 years. This will enable our understanding of historical trends.
- If executed via events, real-time coverage can be achieved.

#### Disadvantages
- AWS Config does not have total [coverage](https://docs.aws.amazon.com/config/latest/developerguide/what-is-resource-config-coverage.html) of every AWS resource, in every region.
- Cost. Monitoring 170,000 resources, once a day, would cost over $500 per month.
- AWS Config rules can be manually disabled.

### 2. Query the Service Catalogue
With the aid of CloudQuery, the Service Catalogue has detailed knowledge about the estate, accessible via SQL queries.

In this implementation, we would query the database to understand compliance. Accuracy would be dependant on how fresh the data is.

#### Advantages
- Very little, if any, new infrastructure to create.

#### Disadvantages
- Understanding what can be tagged, via SQL, is tricky.
- Potential to assess compliance against stale data.

## Decision
Query the Service Catalogue.
