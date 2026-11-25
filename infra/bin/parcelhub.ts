import { App, Tags } from 'aws-cdk-lib';
import { ApiStack } from '../lib/api-stack';

const app = new App();

new ApiStack(app, 'ParcelHub-Dev', {
  // Account comes from your AWS CLI profile at deploy time; synth works without one.
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'eu-west-2' },
  description: 'ParcelHub dev: HTTP API and Lambda handlers',
});

// Every resource is tagged so scripts/teardown.ps1 can find leftovers.
Tags.of(app).add('project', 'parcelhub');
Tags.of(app).add('stage', 'dev');
