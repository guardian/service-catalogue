# Data Accuracy

## Status
Proposed.

## Context
The Guardian Service Catalogue sources data from AWS, GitHub, Snyk etc. using [CloudQuery](02-cloudquery.md).

The vast corpus of data this has provided has enabled the department to answer questions very quickly.

A previous attempt to answer the question "which account is this S3 bucket in?" has highlighted some missing data[^1].

With Service Catalogue now driving business decisions through RepoCop or SLO dashboards, we want to verify the accuracy of the data it holds.

We plan to do this by asking AWS to count the number of resources, and compare that to the count in Service Catalogue:
1. Count the resources in Service Catalogue's database
2. Count the resources AWS reports
3. Alarm when these numbers differ

This ADR outlines options for implementing the second item.

## Positions
### 1. [AWS Resource Explorer](https://docs.aws.amazon.com/resource-explorer/latest/userguide/welcome.html)
AWS Resource Explorer allows one to search resources in an AWS account.
It works in all regions, and provides an aggregated view of all regions.
That is, it provides a simple way to search for resources.

Although it is a free service, AWS Resource Explorer is a little tricky to roll out.
It needs to be [enabled in each region](https://docs.aws.amazon.com/resource-explorer/latest/userguide/manage-aggregator-region.html).

AWS does provide recommendations for rolling Resource Explorer out to an organisation.
However, it requires [Stack Sets](https://docs.aws.amazon.com/resource-explorer/latest/userguide/manage-service-all-org-with-stacksets.html).
Our departmental tooling doesn't yet have Stack Set support, so setup would be manual.

AWS Resource Explorer also [supports a subset of AWS resources](https://docs.aws.amazon.com/resource-explorer/latest/userguide/supported-resource-types.html).
That is, we would not be able to verify all the data in Service Catalogue.
Notably, support for AWS CloudFormation is missing.

### 2. [AWS Config](https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html)
AWS Config is primarily a resource compliance tool. However, it does provide:

> fine-grained visibility into what resources exist
> – https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html#common-scenarios

We have AWS Config deployed to a few of our AWS accounts already.

Similar to AWS Resource Explorer, AWS Config [supports a subset of AWS resources](https://docs.aws.amazon.com/config/latest/developerguide/resource-config-reference.html#supported-resources).
That is, we would not be able to verify all the data in Service Catalogue.

### 3. Use the SDKs directly
Whilst it is true that Service Catalogue's corpus is vast, we are currently only using a subset to drive business decisions. 
Given this, we could interact with the AWS SDKs directly for the specific resources that we need.

This solution would likely require more code than the others.
However:
- Setup cost is reduced
- The data we verify can also be more targeted
- It provides a framework to verify non-AWS data too

## Decision
Use the AWS SDKs directly.

[^1]: This has since been patched in https://github.com/cloudquery/cloudquery/pull/14476.
