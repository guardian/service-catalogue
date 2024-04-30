ARG alpine_version

FROM alpine:${alpine_version}

RUN apk update
RUN apk add postgresql-client aws-cli jq

RUN mkdir /sql
VOLUME /sql

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

