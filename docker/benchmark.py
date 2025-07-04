#!/usr/bin/env python3
import os
import torch
import torch.utils.benchmark as benchmark
import logging

logger = logging.getLogger(__name__)

def get_device():
    compute_device = os.environ.get('COMPUTE_DEVICE', 'cpu')
    if compute_device == 'gpu' and torch.cuda.is_available():
        device = torch.device('cuda')
        logger.info("実行環境: cuda")
    else:
        device = torch.device('cpu')
        logger.info("実行環境: cpu")
    return device

def run_matmul_benchmark(device):
    logger.info("=== 行列積ベンチマーク開始 ===")
    
    a = torch.randn(4096, 4096, device=device)
    b = torch.randn(4096, 4096, device=device)
    
    timer = benchmark.Timer(
        stmt='torch.matmul(a, b)',
        globals={'a': a, 'b': b, 'torch': torch}
    )
    
    result = timer.blocked_autorange()
    time_seconds = result.median
    
    logger.info(f"MatMul Time: {time_seconds:.3f} seconds")
    return time_seconds

def run_conv_benchmark(device):
    logger.info("=== 畳み込みベンチマーク開始 ===")
    
    input_tensor = torch.randn(32, 256, 128, 128, device=device)
    conv_layer = torch.nn.Conv2d(256, 256, kernel_size=3, padding=1).to(device)
    
    timer = benchmark.Timer(
        stmt='conv_layer(input_tensor)',
        globals={'conv_layer': conv_layer, 'input_tensor': input_tensor}
    )
    
    result = timer.blocked_autorange()
    time_seconds = result.median
    
    logger.info(f"Convolution Time: {time_seconds:.3f} seconds")
    return time_seconds


def run_benchmark():
    device = get_device()
    benchmark_type = os.environ.get('BENCHMARK_TYPE', 'all')
    
    logger.info(f"ベンチマーク種別: {benchmark_type}")
    
    results = {}
    
    if benchmark_type in ['all', 'matmul']:
        results['matmul'] = run_matmul_benchmark(device)
    
    if benchmark_type in ['all', 'conv']:
        results['convolution'] = run_conv_benchmark(device)
    
    logger.info("=== ベンチマーク結果サマリー ===")
    for name, time_val in results.items():
        logger.info(f"{name}: {time_val:.3f} seconds")
    
    if len(results) > 1:
        total_time = sum(results.values())
        logger.info(f"Total Time: {total_time:.3f} seconds")
    
    logger.info("ベンチマーク完了")

if __name__ == "__main__":
    run_benchmark()