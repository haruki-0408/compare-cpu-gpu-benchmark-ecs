import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface BenchmarkTaskDefinitionsProps {
  readonly repository: ecr.Repository;
  readonly logGroup: logs.LogGroup;
}

export class BenchmarkTaskDefinitions extends Construct {
  public readonly cpuTaskDefinition: ecs.Ec2TaskDefinition;
  public readonly gpuTaskDefinition: ecs.Ec2TaskDefinition;

  constructor(scope: Construct, id: string, props: BenchmarkTaskDefinitionsProps) {
    super(scope, id);

    const taskExecutionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    // CloudWatch Logsへの書き込み権限を付与
    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      inlinePolicies: {
        CloudWatchLogsPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'logs:CreateLogStream',
                'logs:PutLogEvents',
              ],
              resources: [props.logGroup.logGroupArn],
            }),
          ],
        }),
      },
    });

    // CPU用タスク定義
    this.cpuTaskDefinition = new ecs.Ec2TaskDefinition(this, 'CpuTaskDefinition', {
      executionRole: taskExecutionRole,
      taskRole: taskRole,
      networkMode: ecs.NetworkMode.AWS_VPC,
    });

    this.cpuTaskDefinition.addContainer('cpu-benchmark', {
      image: ecs.ContainerImage.fromEcrRepository(props.repository, 'latest'),
      memoryLimitMiB: 256,
      cpu: 256,
      essential: true,
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'cpu',
        logGroup: props.logGroup,
      }),
      environment: {
        COMPUTE_DEVICE: 'cpu',
      },
    });

    // GPU用タスク定義
    this.gpuTaskDefinition = new ecs.Ec2TaskDefinition(this, 'GpuTaskDefinition', {
      executionRole: taskExecutionRole,
      taskRole: taskRole,
      networkMode: ecs.NetworkMode.AWS_VPC,
    });

    this.gpuTaskDefinition.addContainer('gpu-benchmark', {
      image: ecs.ContainerImage.fromEcrRepository(props.repository, 'latest'),
      memoryLimitMiB: 512,
      cpu: 512,
      essential: true,
      gpuCount: 1,
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'gpu',
        logGroup: props.logGroup,
      }),
      environment: {
        COMPUTE_DEVICE: 'gpu',
        NVIDIA_DRIVER_CAPABILITIES: 'all',
      },
    });
  }
}