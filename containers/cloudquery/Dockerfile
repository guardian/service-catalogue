ARG CQ_CLI

FROM ghcr.io/cloudquery/cloudquery:${CQ_CLI}

# Need to install RDS certs before running Cloudquery container due to
# access to the root filesystem being restricted
RUN apk add --no-cache ca-certificates
RUN wget -O /usr/local/share/ca-certificates/global-bundle.crt -q https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
RUN update-ca-certificates
