use criterion::{black_box, criterion_group, criterion_main, Criterion};
use hp_data_structures::concurrent_hash_map::LockFreeHashMap;

fn bench_insert(c: &mut Criterion) {
    c.bench_function("insert", |b| {
        let map = LockFreeHashMap::new();
        b.iter(|| {
            for i in 0..1000 {
                map.insert(i, i);
            }
        });
    });
}

criterion_group!(benches, bench_insert);
criterion_main!(benches); 