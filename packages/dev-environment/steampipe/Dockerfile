FROM ghcr.io/turbot/steampipe

ARG GITHUB_PLUGIN_VERSION
ARG AWS_PLUGIN_VERSION

RUN steampipe plugin install steampipe github@${GITHUB_PLUGIN_VERSION} aws@${AWS_PLUGIN_VERSION}
