FROM node:18-alpine

WORKDIR /usr/src/app

# Install the AWS CLI
# This is used to fetch the prisma directory from S3
RUN apk --no-cache add aws-cli

# Install the Prisma NPM package
# This will allow us to use the prisma migrate deploy command
RUN npm init -y
RUN npm install prisma

COPY ./containers/prisma-migrate/run-prisma-migrate.sh ./run-prisma-migrate.sh
RUN chmod +x ./run-prisma-migrate.sh

# The default entrypoint for the node image is `node ...`
# Switch it back here so we can run a .sh script
ENTRYPOINT [ "sh" ]

CMD ["./run-prisma-migrate.sh"]