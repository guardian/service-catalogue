# Tagging Obligation - Extension 01

## Status
Removed.

## Positions
### AWS Resource Tagging Standard
Since [the original ADR](./04-tagging-obligation.md), AWS Security Hub has [introduced the AWS Resource Tagging Standard](https://aws.amazon.com/about-aws/whats-new/2024/04/aws-security-hub-resource-tagging-standard/).

#### Advantages
Using the Resource Tagging Standard means AWS becomes responsible for identifying resource tags, 
allowing us to focus on presenting the findings in the most accessible way to our users.

#### Disadvantages
The Resource Tagging Standard does not cover _all_ AWS resources.
However, it covers all that we're using today.

In particular, it covers AWS CloudFormation, which when considered in conjunction with our other obligation of defining resources with IaC, we have complete coverage.

## Decision
The previous decision was to query various tables within the Service Catalogue to identify tag usage.

Our updated decision is to use the AWS Resource Tagging Standard to identify tag usage,
ingest the results into Service Catalogue, and query the `aws_security_hub_findings` table to understand compliance.
