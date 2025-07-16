use criterion::{black_box, criterion_group, criterion_main, Criterion};
use hp_data_structures::combinatorics::binomial_mod;

fn bench_binomial_mod(c: &mut Criterion) {
    c.bench_function("binomial_mod", |b| {
        b.iter(|| {
            let _ = binomial_mod(20, 10, 1_000_000_007);
        });
    });
}

criterion_group!(benches, bench_binomial_mod);
criterion_main!(benches); 