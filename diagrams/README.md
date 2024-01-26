# Diagrams

This folder contains the DSL for architecture diagrams. It also contains images of the generated views. It should be kept more or less up to date as the architecture of the service catlogue changes.

## Setup

For linting, autocompletion, and other IDE benefits, you should:

- Install the VSCode plugin C4 DSL Extension (extension ID: `systemticks.c4-dsl-extension`)
- Install Java 17
- Make sure `JAVA_HOME` is set to your Java 17 installation

## TODO

The architecture diagrams do not auto-update - they are screenshots from within VSCode. Ideally they could be regenerated using a CLI command, or on the fly as the [workspace file](./workspace.dsl) is saved.
