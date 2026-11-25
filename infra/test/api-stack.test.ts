import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { describe, expect, it } from 'vitest';
import { ApiStack } from '../lib/api-stack';

const template = Template.fromStack(new ApiStack(new App(), 'Test', { env: { region: 'eu-west-2' } }));

describe('ApiStack', () => {
  it('runs every function on Node.js 22 / arm64', () => {
    template.resourceCountIs('AWS::Lambda::Function', 2);
    template.allResourcesProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs22.x',
      Architectures: ['arm64'],
    });
  });

  it('exposes the versioned parcel route and a health check', () => {
    const routes = Object.values(template.findResources('AWS::ApiGatewayV2::Route')) as Array<{
      Properties: { RouteKey: string };
    }>;
    const routeKeys = routes.map((route) => route.Properties.RouteKey);
    expect(routeKeys.sort()).toEqual(['GET /health', 'POST /v1/parcels']);
  });

  it('keeps logs for one week and deletes them with the stack', () => {
    template.allResourcesProperties('AWS::Logs::LogGroup', { RetentionInDays: 7 });
    template.allResources('AWS::Logs::LogGroup', { DeletionPolicy: 'Delete' });
  });

  it('creates no NAT gateways or VPC (cost safety)', () => {
    template.resourceCountIs('AWS::EC2::NatGateway', 0);
    template.resourceCountIs('AWS::EC2::VPC', 0);
  });
});
