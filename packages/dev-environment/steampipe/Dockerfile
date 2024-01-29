FROM ghcr.io/turbot/steampipe

COPY ./github/steampipe-plugin-github.plugin  /home/steampipe/.steampipe/plugins/local/github/steampipe-plugin-github.plugin
COPY ./github/github.spc  /home/steampipe/.steampipe/config/github.spc

RUN  steampipe plugin install steampipe aws@0.129.0


