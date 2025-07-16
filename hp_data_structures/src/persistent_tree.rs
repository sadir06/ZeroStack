use std::rc::Rc;

#[derive(Clone)]
pub enum Tree<K, V> {
    Empty,
    Node {
        key: K,
        value: V,
        left: Rc<Tree<K, V>>,
        right: Rc<Tree<K, V>>,
        height: usize,
    },
}

impl<K: Ord + Clone, V: Clone> Tree<K, V> {
    pub fn new() -> Rc<Self> {
        Rc::new(Tree::Empty)
    }

    pub fn insert(tree: Rc<Self>, key: K, value: V) -> Rc<Self> {
        // AVL insert logic (simplified for brevity)
        match &*tree {
            Tree::Empty => Rc::new(Tree::Node {
                key,
                value,
                left: Rc::new(Tree::Empty),
                right: Rc::new(Tree::Empty),
                height: 1,
            }),
            Tree::Node { key: k, value: v, left, right, height } => {
                if key < *k {
                    let new_left = Self::insert(left.clone(), key, value);
                    Rc::new(Tree::Node {
                        key: k.clone(),
                        value: v.clone(),
                        left: new_left,
                        right: right.clone(),
                        height: *height, // Not rebalancing for brevity
                    })
                } else if key > *k {
                    let new_right = Self::insert(right.clone(), key, value);
                    Rc::new(Tree::Node {
                        key: k.clone(),
                        value: v.clone(),
                        left: left.clone(),
                        right: new_right,
                        height: *height,
                    })
                } else {
                    Rc::new(Tree::Node {
                        key: k.clone(),
                        value,
                        left: left.clone(),
                        right: right.clone(),
                        height: *height,
                    })
                }
            }
        }
    }

    pub fn map<F, U>(tree: Rc<Self>, f: &F) -> Rc<Tree<K, U>>
    where
        F: Fn(&V) -> U,
    {
        match &*tree {
            Tree::Empty => Rc::new(Tree::Empty),
            Tree::Node { key, value, left, right, height } => Rc::new(Tree::Node {
                key: key.clone(),
                value: f(value),
                left: Self::map(left.clone(), f),
                right: Self::map(right.clone(), f),
                height: *height,
            }),
        }
    }
    // Add filter/reduce as needed
} 