import * as cdk from 'aws-cdk-lib';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class BenchmarkCloudWatchLogs extends Construct {
  public readonly logGroup: logs.LogGroup;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.logGroup = new logs.LogGroup(this, 'BenchmarkLogGroup', {
      logGroupName: '/ecs/benchmark',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}