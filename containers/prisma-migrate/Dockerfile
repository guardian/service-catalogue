FROM node:20.20.2-alpine

WORKDIR /usr/src/app

# Install the AWS CLI
# This is used to fetch the prisma directory from S3
RUN apk --no-cache add aws-cli

COPY ./run-prisma-migrate.sh /usr/src/app/run-prisma-migrate.sh
RUN chmod +x /usr/src/app/run-prisma-migrate.sh

COPY ./prisma.config.ts /usr/src/app/prisma.config.ts

# The default entrypoint for the node image is `node ...`
# Switch it back here so we can run a .sh script
ENTRYPOINT [ "sh" ]

CMD ["/usr/src/app/run-prisma-migrate.sh"]
