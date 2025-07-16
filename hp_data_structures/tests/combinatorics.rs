use hp_data_structures::combinatorics::binomial_mod;

#[test]
fn test_binomial_mod() {
    let p = 1_000_000_007;
    assert_eq!(binomial_mod(5, 2, p), 10);
    assert_eq!(binomial_mod(6, 3, p), 20);
    assert_eq!(binomial_mod(10, 0, p), 1);
    assert_eq!(binomial_mod(10, 10, p), 1);
} 