import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface BenchmarkEcsClusterProps {
  readonly vpc: ec2.Vpc;
}

export class BenchmarkEcsCluster extends Construct {
  public readonly cluster: ecs.Cluster;

  constructor(scope: Construct, id: string, props: BenchmarkEcsClusterProps) {
    super(scope, id);

    this.cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: props.vpc,
      clusterName: 'benchmark-cluster',
    });

    // ECS インスタンス用のIAMロール
    const ecsInstanceRole = new iam.Role(this, 'EcsInstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonEC2ContainerServiceforEC2Role'),
      ],
    });

    // CPU用インスタンス - 4 vCPU, 16GB RAM
    new ec2.Instance(this, 'CpuInstance', {
      vpc: props.vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.M5, ec2.InstanceSize.XLARGE),
      machineImage: ecs.EcsOptimizedImage.amazonLinux2023(),
      role: ecsInstanceRole,
      userData: ec2.UserData.custom(
        `#!/bin/bash
        echo ECS_CLUSTER=${this.cluster.clusterName} >> /etc/ecs/ecs.config`
      ),
    });

    // GPU用インスタンス - 4 vCPU, 16GB RAM + T4 GPU
    new ec2.Instance(this, 'GpuInstance', {
      vpc: props.vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.G4DN, ec2.InstanceSize.XLARGE),
      machineImage: ecs.EcsOptimizedImage.amazonLinux2023(ecs.AmiHardwareType.GPU),
      role: ecsInstanceRole,
      userData: ec2.UserData.custom(
        `#!/bin/bash
        echo ECS_CLUSTER=${this.cluster.clusterName} >> /etc/ecs/ecs.config`
      ),
    });
  }
}