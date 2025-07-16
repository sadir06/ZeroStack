use std::rc::Rc;
use hp_data_structures::persistent_tree::Tree;

#[test]
fn test_insert_and_map() {
    let tree = Tree::new();
    let tree = Tree::insert(tree, 1, 10);
    let tree = Tree::insert(tree, 2, 20);
    let mapped = Tree::map(tree.clone(), &|v| v * 2);
    // Check that mapping doubled the values
    if let Tree::Node { value, .. } = &*mapped {
        assert_eq!(*value, 20);
    }
} 