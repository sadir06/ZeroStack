use std::sync::atomic::{AtomicPtr, Ordering};
use std::sync::Arc;
use std::hash::{Hash, Hasher};
use std::collections::hash_map::DefaultHasher;

const BUCKETS: usize = 64;

pub struct LockFreeHashMap<K, V> {
    buckets: Vec<AtomicPtr<Node<K, V>>>,
}

struct Node<K, V> {
    key: K,
    value: V,
    next: *mut Node<K, V>,
}

impl<K: Eq + Hash, V> LockFreeHashMap<K, V> {
    pub fn new() -> Self {
        let mut buckets = Vec::with_capacity(BUCKETS);
        for _ in 0..BUCKETS {
            buckets.push(AtomicPtr::new(std::ptr::null_mut()));
        }
        LockFreeHashMap { buckets }
    }

    fn hash<Q: ?Sized>(&self, key: &Q) -> usize
    where
        K: std::borrow::Borrow<Q>,
        Q: Hash,
    {
        let mut hasher = DefaultHasher::new();
        key.hash(&mut hasher);
        (hasher.finish() as usize) % BUCKETS
    }

    pub fn insert(&self, key: K, value: V) {
        // This is a simplified version, not fully lock-free!
        let idx = self.hash(&key);
        let node = Box::into_raw(Box::new(Node {
            key,
            value,
            next: std::ptr::null_mut(),
        }));
        let head = &self.buckets[idx];
        unsafe {
            (*node).next = head.load(Ordering::SeqCst);
            head.store(node, Ordering::SeqCst);
        }
    }

    pub fn get<Q: ?Sized>(&self, key: &Q) -> Option<V>
    where
        K: std::borrow::Borrow<Q>,
        Q: Hash + Eq,
        V: Clone,
    {
        let idx = self.hash(key);
        let mut curr = self.buckets[idx].load(Ordering::SeqCst);
        unsafe {
            while !curr.is_null() {
                if (*curr).key.borrow() == key {
                    return Some((*curr).value.clone());
                }
                curr = (*curr).next;
            }
        }
        None
    }
} 