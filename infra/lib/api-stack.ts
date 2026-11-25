import * as path from 'node:path';
import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib';
import { CorsHttpMethod, HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import type { Construct } from 'constructs';

const repoRoot = path.resolve(__dirname, '../..');
const handlersDir = path.join(repoRoot, 'services/api/src/handlers');

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const healthFn = this.handler('Health', 'health.ts');
    const createParcelFn = this.handler('CreateParcel', 'create-parcel.ts');

    const api = new HttpApi(this, 'HttpApi', {
      apiName: 'parcelhub-dev',
      // Dev only: week 8 narrows this to the deployed web app's origin.
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST],
        allowHeaders: ['content-type', 'idempotency-key'],
      },
    });

    api.addRoutes({
      path: '/health',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('HealthIntegration', healthFn),
    });
    api.addRoutes({
      path: '/v1/parcels',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration('CreateParcelIntegration', createParcelFn),
    });

    new CfnOutput(this, 'ApiUrl', { value: api.apiEndpoint });
  }

  private handler(name: string, entry: string): NodejsFunction {
    // Explicit log group: one-week retention, and deleted with the stack (CDK keeps logs forever by default).
    const logGroup = new LogGroup(this, `${name}Logs`, {
      retention: RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    return new NodejsFunction(this, name, {
      entry: path.join(handlersDir, entry),
      handler: 'handler',
      runtime: Runtime.NODEJS_22_X,
      architecture: Architecture.ARM_64,
      memorySize: 256,
      timeout: Duration.seconds(10),
      logGroup,
      projectRoot: repoRoot,
      depsLockFilePath: path.join(repoRoot, 'package-lock.json'),
      bundling: { minify: true, target: 'node22' },
    });
  }
}
