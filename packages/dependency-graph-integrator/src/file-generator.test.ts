import assert from 'assert';
import { describe, it } from 'node:test';
import { createYaml } from './file-generator.js';

void describe('createYaml for sbt', () => {
	void it('should generate the following yaml file', () => {
		const yaml = createYaml('branch', 'Scala', 'repo1');
		const result =
			String.raw`name: Update Dependency Graph for sbt
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
        uses: actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8 # v5.0.0
      - name: Install Java
        id: java
        uses: actions/setup-java@dded0888837ed1f317902acf8a20df0ad188d165 # v5.0.0
        with:
          distribution: corretto
          java-version: 21
      - name: Install sbt
        id: sbt
        uses: sbt/setup-sbt@7106bdca9eae3f592a8baeccf57b5a3e06c0de5f # v1.1.14
      - name: Submit dependencies
        id: submit
        uses: scalacenter/sbt-dependency-submission@64084844d2b0a9b6c3765f33acde2fbe3f5ae7d3 # v3.1.0
      - name: Log snapshot for user validation
        id: validate
        run: cat` +
			' ${{ steps.submit.outputs.snapshot-json-path }} | jq' + // Need to split this line to avoid syntax errors due to the template string
			String.raw`
    permissions:
      contents: write
`;
		assert.strictEqual(yaml, result);
	});
});

void describe('createYaml for Kotlin', () => {
	void it('should generate the following yaml file', () => {
		const yaml = createYaml('branch', 'Kotlin', 'repo2');
		const result =
			String.raw`name: Update Dependency Graph for Gradle
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
        uses: actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8 # v5.0.0
      - name: Set up Java
        id: setup
        uses: actions/setup-java@dded0888837ed1f317902acf8a20df0ad188d165 # v5.0.0
        with:
          distribution: temurin
          java-version: 21
      - name: Submit dependencies
        id: submit
        uses: gradle/actions/dependency-submission@f236b35da9d031e13b1005234ebe4392ed54c580 # v5.0.0
      - name: Log snapshot for user validation
        id: validate
        run: cat ` + // Need to split this line to avoid errors due to new line produced in yaml
			'/home/runner/work/repo2/repo2/dependency-graph-reports/update_dependency_graph_for_gradle-dependency-graph.json\n          | jq' +
			String.raw`
    permissions:
      contents: write
`;
		assert.strictEqual(yaml, result);
	});
});
