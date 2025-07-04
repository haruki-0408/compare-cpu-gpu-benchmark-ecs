import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

export class BenchmarkEcr extends Construct {
  public readonly repository: ecr.Repository;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.repository = new ecr.Repository(this, 'BenchmarkRepository', {
      repositoryName: 'pytorch-benchmark',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}