# CPU/GPU Benchmark Comparison on ECS

## デプロイ手順

### 1. 依存関係のインストール
```bash
npm install
```

### 2. AWSアカウント設定
```bash
aws configure
npx cdk bootstrap
```

### 3. インフラのデプロイ
```bash
npx cdk deploy
```

### 4. ECRリポジトリURI確認
```bash
aws cloudformation describe-stacks \
    --stack-name benchmark-dev-BenchmarkStack \
    --query 'Stacks[0].Outputs[?OutputKey==`RepositoryUri`].OutputValue' \
    --output text
```

### 5. Dockerイメージのビルド・プッシュ
```bash
# ECRにログイン
aws ecr get-login-password --region ap-northeast-1 | \
docker login --username AWS --password-stdin <REPOSITORY_URI>

cd docker
docker build -f Dockerfile.cpu -t <REPOSITORY_URI>:latest .
docker push <REPOSITORY_URI>:latest
```

### 6. ベンチマーク実行
```bash
# CPUベンチマーク
aws ecs run-task \
    --cluster benchmark-cluster \
    --task-definition benchmark-dev-BenchmarkStack-BenchmarkTaskDefs-CpuTaskDefinition \
    --launch-type EC2

# GPUベンチマーク
aws ecs run-task \
    --cluster benchmark-cluster \
    --task-definition benchmark-dev-BenchmarkStack-BenchmarkTaskDefs-GpuTaskDefinition \
    --launch-type EC2
```

### 7. 結果確認
```bash
aws logs describe-log-streams \
    --log-group-name /ecs/benchmark \
    --order-by LastEventTime \
    --descending
```

### 8. クリーンアップ
```bash
npx cdk destroy
```
