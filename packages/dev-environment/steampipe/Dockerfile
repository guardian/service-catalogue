FROM ghcr.io/turbot/steampipe

ARG SP_GITHUB
ARG SP_AWS

RUN steampipe plugin install steampipe github@${SP_GITHUB} aws@${SP_AWS}

# Install awscli (root user needed)
USER root
RUN apt-get update && apt-get install -y awscli

# Set environment variables, for access by scripts at runtime
ENV AWS_VERSION ${SP_AWS}

USER steampipe
COPY generate-aws-plugin-config /usr/local/bin/generate-aws-plugin-config
