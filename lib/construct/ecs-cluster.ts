import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
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

    // CPU用インスタンス - 4 vCPU, 16GB RAM
    const cpuAutoScalingGroup = new autoscaling.AutoScalingGroup(this, 'CpuAutoScalingGroup', {
      vpc: props.vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.M5, ec2.InstanceSize.XLARGE),
      machineImage: ecs.EcsOptimizedImage.amazonLinux2023(),
      minCapacity: 1,
      maxCapacity: 1,
      desiredCapacity: 1,
    });

    // GPU用インスタンス - 4 vCPU, 16GB RAM + T4 GPU
    const gpuAutoScalingGroup = new autoscaling.AutoScalingGroup(this, 'GpuAutoScalingGroup', {
      vpc: props.vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.G4DN, ec2.InstanceSize.XLARGE),
      machineImage: ecs.EcsOptimizedImage.amazonLinux2023(ecs.AmiHardwareType.GPU),
      minCapacity: 1,
      maxCapacity: 1,
      desiredCapacity: 1,
    });

    this.cluster.addAutoScalingGroup(cpuAutoScalingGroup);
    this.cluster.addAutoScalingGroup(gpuAutoScalingGroup);
  }
}