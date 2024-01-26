workspace {
    model {
        dev = person "Developer" "A Guardian software engineer"
        devxDev = person "DevX Developer" "A Guardian software engineer"
        cloudquery = softwareSystem "Cloudquery" "Scheduled tasks that collect data about our code/cloud platforms"

        cloudqueryDB = softwareSystem "Cloudquery DB" "Postgres database that stores information from cloudquery and Repocop" "datastore"

        github = softwareSystem "GitHub" "Source code repository"
        snyk = softwareSystem "Snyk" "Vulnerability scanner"
        aws = softwareSystem "AWS" "Cloud platform"
        repocop = softwareSystem "Repocop" "A collection of lambdas that track and enforce adherence to best practices and obligations. Includes repocpo, interactive-monitor, and snyk-integrator"
        grafana = softwareSystem "Grafana" "A dashboarding tool" "web"
        anghammarad = softwareSystem "Anghammarad" "A messaging service"

        snyk -> cloudquery "Data from snyk populates Cloudquery tables" "Cloudquery plugin running on fargate"
        github -> cloudquery "Data from snyk populates Cloudquery tables" "Cloudquery plugin running on fargate"
        aws -> cloudquery "Data from snyk populates Cloudquery tables" "Cloudquery plugin running on fargate"
        cloudquery -> cloudqueryDB "Cloudquery writes data to the DB"
        cloudqueryDB -> repocop "1. Cloudquery data is used to calculate departmental compliance with obligations" "SQL queries using Prisma ORM via TypeScript"
        repocop -> cloudqueryDB "2. Repocop stores compliance information about repos as a table in the cloudquery DB"
        cloudqueryDB -> grafana "Cloudquery data powers grafana dashboards" "SQL queries on Postgres DB"
        repocop -> dev "Repocop raises PRs to fix issues, that are reviewed by developers"
        grafana -> devxDev "Compliance dashboards are used by DevX developers to track departmental progress towards obligations"
        grafana -> dev "Compliance dashboards are used by developers to track their team's progress towards obligations. They also have read access to raw cloudquery tables."
        repocop -> anghammarad "Repocop sends notifications of events, or warnings to teams via Anghammarad"
        anghammarad -> dev "Anghammarad delivers messages to developers about changes to their systems" "Email or Google Chat"
    }

    views {
        systemLandscape "SystemLandscape" {
            include *
            autoLayout
        }

        systemContext cloudquery "SystemContextCloudquery" {
            include *
            autoLayout
        }

        systemContext repocop "SystemContextRepocop" {
            include *
            autoLayout
        }

        styles {
            element "Person" {
                shape Person
            }
            element "datastore" {
                shape Cylinder
            }
            element "web" {
                shape WebBrowser
            }
        }


    }
}