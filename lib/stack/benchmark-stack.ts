import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Network } from '../construct/network';
import { BenchmarkEcsCluster } from '../construct/ecs-cluster';
import { BenchmarkEcr } from '../construct/ecr';
import { BenchmarkTaskDefinitions } from '../construct/task-definitions';
import { BenchmarkCloudWatchLogs } from '../construct/cloudwatch-logs';

export class BenchmarkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const network = new Network(this, 'Network');
    const logs = new BenchmarkCloudWatchLogs(this, 'BenchmarkLogs');
    const ecr = new BenchmarkEcr(this, 'BenchmarkEcr');
    const cluster = new BenchmarkEcsCluster(this, 'BenchmarkCluster', {
      vpc: network.vpc,
    });

    new BenchmarkTaskDefinitions(this, 'BenchmarkTaskDefs', {
      repository: ecr.repository,
      logGroup: logs.logGroup,
    });
    
    new cdk.CfnOutput(this, 'ClusterName', {
      value: cluster.cluster.clusterName,
    });

    new cdk.CfnOutput(this, 'RepositoryUri', {
      value: ecr.repository.repositoryUri,
    });

    new cdk.CfnOutput(this, 'LogGroupName', {
      value: logs.logGroup.logGroupName,
    });
  }
}