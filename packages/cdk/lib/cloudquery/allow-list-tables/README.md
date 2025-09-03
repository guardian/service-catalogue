# Allow List for CloudQuery Collected Tables
We only collect data with CloudQuery for the tables that we explicitly list in source control.
We still need skippedTables because ServiceCatalogue collects child tables automatically.

## Collected Tables
This directory contains the collected tables for CloudQuery.

### History
We started with cloudquery by collecting most data that CloudQuery offers. CloudQuery often add new tables in new
releases. This meant our usage could dramatically increase just by changing a version number. So we decided to switch to
an allow list approach, where we explicitly list the tables we want to collect.

### Tables we have chosen not to collect early on
The skipTables array includes tables we are skipping because they are slow and or uninteresting to us.
