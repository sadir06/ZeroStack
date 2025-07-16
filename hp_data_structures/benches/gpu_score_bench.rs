use criterion::{black_box, criterion_group, criterion_main, Criterion};
use hp_data_structures::gpu_score::GpuScorer;

fn cpu_softmax(input: &[f32]) -> Vec<f32> {
    let max_val = input.iter().fold(f32::NEG_INFINITY, |a, &b| a.max(b));
    let exp_sum: f32 = input.iter().map(|&x| (x - max_val).exp()).sum();
    input.iter().map(|&x| (x - max_val).exp() / exp_sum).collect()
}

fn bench_gpu_vs_cpu(c: &mut Criterion) {
    let mut group = c.benchmark_group("softmax");
    
    let input: Vec<f32> = (0..1000).map(|i| i as f32).collect();
    
    group.bench_function("cpu_softmax", |b| {
        b.iter(|| {
            cpu_softmax(black_box(&input));
        });
    });
    
    group.bench_function("gpu_softmax", |b| {
        b.iter_custom(|iters| {
            let rt = tokio::runtime::Runtime::new().unwrap();
            rt.block_on(async {
                let scorer = GpuScorer::new().await.unwrap();
                let start = std::time::Instant::now();
                for _ in 0..iters {
                    let _ = scorer.compute_softmax_and_top_k(&input, 10).unwrap();
                }
                start.elapsed()
            })
        });
    });
    
    group.finish();
}

criterion_group!(benches, bench_gpu_vs_cpu);
criterion_main!(benches); 