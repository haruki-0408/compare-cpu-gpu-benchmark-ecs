import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BenchmarkStack } from '../stack/benchmark-stack';

export interface BenchmarkStageProps extends cdk.StageProps {
  readonly environment: string;
}

export class BenchmarkStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: BenchmarkStageProps) {
    super(scope, id, props);

    new BenchmarkStack(this, 'BenchmarkStack', {
      stackName: `benchmark-${props.environment}`,
      description: 'CPU/GPU benchmark comparison stack',
      env: props.env,
    });
  }
}