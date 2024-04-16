FROM ghcr.io/cloudquery/cloudquery:5.2.0

# Need to install RDS certs before running Cloudquery container due to
# access to the root filesystem being restricted
RUN wget -O /usr/local/share/ca-certificates/global-bundle.crt -q https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem && update-ca-certificates
