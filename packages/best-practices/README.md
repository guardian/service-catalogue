# Best Practice Generator
This is a small TypeScript script to generate the [best practices markdown file](best-practices.md).

## Adding a new best practice
To add a new best practice, follow these steps:
1. Update [definitions.ts](src/definitions.ts). Before adding a best practice, consider:
   - How one can identify if it's being followed (e.g. a dashboard, or a command to run)
   - How to exempt from it.
2. Generate the markdown file via `npm -w best-practices run generate` (this will also type-check, and format your changes).
3. Raise a PR with your changes.
