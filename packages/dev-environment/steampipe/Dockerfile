FROM ghcr.io/turbot/steampipe

ARG SP_GITHUB
ARG SP_AWS

RUN steampipe plugin install steampipe github@${SP_GITHUB} aws@${SP_AWS}
