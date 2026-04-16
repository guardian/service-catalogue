FROM node:20.20.2-alpine

WORKDIR /usr/src/app

# Install the AWS CLI
# This is used to fetch the prisma directory from S3
RUN apk --no-cache add aws-cli

# Install the Prisma NPM package
# This will allow us to use the prisma migrate deploy command
RUN npm init -y
# TODO: Keep the version automatically in sync with common/package.json
RUN npm install prisma@7.6.0

COPY ./run-prisma-migrate.sh /usr/src/app/run-prisma-migrate.sh
RUN chmod +x /usr/src/app/run-prisma-migrate.sh

# The default entrypoint for the node image is `node ...`
# Switch it back here so we can run a .sh script
ENTRYPOINT [ "sh" ]

CMD ["/usr/src/app/run-prisma-migrate.sh"]
