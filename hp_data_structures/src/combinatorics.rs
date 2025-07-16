/// Computes n choose k modulo a prime using Pascal's identity:
/// C(n, k) = C(n-1, k-1) + C(n-1, k)
pub fn binomial_mod(n: usize, k: usize, p: usize) -> usize {
    if k == 0 || k == n {
        1
    } else {
        (binomial_mod(n - 1, k - 1, p) + binomial_mod(n - 1, k, p)) % p
    }
}
