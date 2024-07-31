import { createYaml } from './file-generator';

describe('createYaml for Scala', () => {
	it('should generate the following yaml file', () => {
		const yaml = createYaml('branch', 'Scala');
		const result =
			String.raw`name: Update Dependency Graph for Scala
on:
  push:
    branches:
      - main
      - branch
  workflow_dispatch: 
jobs:
  dependency-graph:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout branch
        id: checkout
        uses: actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332 # v4.1.7
      - name: Submit dependencies
        id: submit
        uses: scalacenter/sbt-dependency-submission@7ebd561e5280336d3d5b445a59013810ff79325e # v3.0.1
      - name: Log snapshot for user validation
        id: validate
        run: cat` +
			' ${{ steps.submit.outputs.snapshot-json-path }} | jq' + // Need to split this line to avoid syntax errors due to the template string
			String.raw`
    permissions:
      contents: write
`;
		expect(yaml).toEqual(result);
	});
});

describe('createYaml for Scala', () => {
	it('should generate the following yaml file', () => {
		const yaml = createYaml('branch', 'Kotlin');
		const result =
			String.raw`name: Update Dependency Graph for Kotlin
on:
  push:
    branches:
      - main
      - branch
  workflow_dispatch: 
jobs:
  dependency-graph:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout branch
        id: checkout
        uses: actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332 # v4.1.7
      - name: Submit dependencies
        id: submit
        uses: gradle/actions/dependency-submission@d9c87d481d55275bb5441eef3fe0e46805f9ef70 # v3.5.0
      - name: Log snapshot for user validation
        id: validate
        run: cat` +
			' ${{ steps.submit.outputs.snapshot-json-path }} | jq' + // Need to split this line to avoid syntax errors due to the template string
			String.raw`
    permissions:
      contents: write
`;
		expect(yaml).toEqual(result);
	});
});
