#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BenchmarkStage } from '../lib/stage/benchmark-stage';

const app = new cdk.App();

new BenchmarkStage(app, 'BenchmarkDev', {
  environment: 'dev',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
  },
});