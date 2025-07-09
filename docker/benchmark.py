#!/usr/bin/env python3
import os
import torch
import torch.utils.benchmark as benchmark

def measure_matmul_performance(device, matrix_size):
    # 行列生成
    a = torch.randn(matrix_size, matrix_size, device=device)
    b = torch.randn(matrix_size, matrix_size, device=device)
    
    # ベンチマーク実行
    timer = benchmark.Timer(
        stmt='torch.matmul(a, b)',
        globals={'a': a, 'b': b, 'torch': torch})
    
    result = timer.blocked_autorange()
    
    # 性能指標計算
    flops = 2 * matrix_size**3
    gflops = flops / (result.median * 1e9)
    
    return result.median * 1000, gflops

def main():
    compute_device = os.environ.get('COMPUTE_DEVICE', 'cpu')
    
    # デバイス設定
    if compute_device == 'gpu' and torch.cuda.is_available():
        device = torch.device('cuda')
        device_name = "GPU"
    else:
        device = torch.device('cpu')
        device_name = "CPU"
    
    print(f"実行環境: {device_name}")
    
    # 3つの行列サイズでテスト
    sizes = [256, 2048, 8192]
    
    for matrix_size in sizes:
        time_ms, gflops = measure_matmul_performance(device, matrix_size)
        print(f"{matrix_size} x {matrix_size}: {time_ms:.2f}ms, {gflops:.2f}GFLOPS")
    
    print(f"{device_name}ベンチマーク完了")

if __name__ == "__main__":
    main()