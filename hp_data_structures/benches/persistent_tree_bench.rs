use criterion::{black_box, criterion_group, criterion_main, Criterion};
use std::rc::Rc;
use hp_data_structures::persistent_tree::Tree;

fn bench_insert(c: &mut Criterion) {
    c.bench_function("insert", |b| {
        b.iter(|| {
            let mut tree = Tree::new();
            for i in 0..1000 {
                tree = Tree::insert(tree, i, i);
            }
        });
    });
}

criterion_group!(benches, bench_insert);
criterion_main!(benches); 