import 'source-map-support/register';
import { CdkGraph } from '@aws/pdk/cdk-graph';
import { CdkGraphDiagramPlugin } from '@aws/pdk/cdk-graph-plugin-diagram';
import { GuRoot } from '@guardian/cdk/lib/constructs/root';
import { App, Duration } from 'aws-cdk-lib';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { ServiceCatalogue } from '../lib/service-catalogue';

const app = new GuRoot();

new ServiceCatalogue(app, 'ServiceCatalogue-PROD', {
	stack: 'deploy',
	stage: 'PROD',
	env: { region: 'eu-west-1' },
	cloudFormationStackName: 'deploy-PROD-service-catalogue',
});

new ServiceCatalogue(app, 'ServiceCatalogue-CODE', {
	stack: 'deploy',
	stage: 'CODE',
	env: { region: 'eu-west-1' },
	schedule: Schedule.rate(Duration.days(30)),
	rdsDeletionProtection: false,
	cloudFormationStackName: 'deploy-CODE-service-catalogue',
});

/*
Uses `aws/pdk` to generate a graph of the CDK application.
The diagram plugin must be wrapped in an async IFEE.

`CdkGraph` creates a diagram for each node attached to `App`.
In the `GuRoot` above, there are two nodes, differing only by `stage`.
This creates a rather busy diagram, with duplicated information.
As a workaround, we create a new `App` and attach only one `ServiceCatalogue` instance to it.
To avoid it causing issues with the rest of the application, we set the `outdir` to a different directory.

See https://aws.github.io/aws-pdk/developer_guides/cdk-graph-plugin-diagram/index.html.
 */
void (async () => {
	const appForGraphing = new App({ outdir: 'cdk.out/graph' });
	new ServiceCatalogue(
		appForGraphing,
		'ServiceCatalogue-PROD-for-diagramming',
		{
			stack: 'deploy',
			stage: 'PROD',
			env: { region: 'eu-west-1' },
			cloudFormationStackName: 'deploy-PROD-service-catalogue',
		},
	);
	const graph = new CdkGraph(appForGraphing, {
		plugins: [new CdkGraphDiagramPlugin()],
	});
	appForGraphing.synth();
	await graph.report();
})();
