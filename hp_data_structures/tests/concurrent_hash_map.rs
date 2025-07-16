use hp_data_structures::concurrent_hash_map::LockFreeHashMap;

#[test]
fn test_insert_and_get() {
    let map = LockFreeHashMap::new();
    map.insert(1, "a");
    assert_eq!(map.get(&1), Some("a"));
} 