use pyo3::prelude::*;
use pyo3::wrap_pyfunction;
use std::collections::HashMap;
use std::sync::Mutex;

/// A thread-safe hash map for Python
#[pyclass]
struct LockFreeHashMap {
    data: Mutex<HashMap<String, PyObject>>,
}

#[pymethods]
impl LockFreeHashMap {
    #[new]
    fn new() -> Self {
        LockFreeHashMap {
            data: Mutex::new(HashMap::new()),
        }
    }

    fn insert(&self, key: String, value: PyObject) -> PyResult<()> {
        let mut data = self.data.lock().unwrap();
        data.insert(key, value);
        Ok(())
    }

    fn get(&self, key: String) -> PyResult<Option<PyObject>> {
        let data = self.data.lock().unwrap();
        Ok(data.get(&key).cloned())
    }

    fn contains_key(&self, key: String) -> PyResult<bool> {
        let data = self.data.lock().unwrap();
        Ok(data.contains_key(&key))
    }

    fn len(&self) -> PyResult<usize> {
        let data = self.data.lock().unwrap();
        Ok(data.len())
    }

    fn is_empty(&self) -> PyResult<bool> {
        let data = self.data.lock().unwrap();
        Ok(data.is_empty())
    }

    fn keys(&self, py: Python) -> PyResult<Vec<String>> {
        let data = self.data.lock().unwrap();
        Ok(data.keys().cloned().collect())
    }

    fn values(&self, py: Python) -> PyResult<Vec<PyObject>> {
        let data = self.data.lock().unwrap();
        Ok(data.values().cloned().collect())
    }

    fn clear(&self) -> PyResult<()> {
        let mut data = self.data.lock().unwrap();
        data.clear();
        Ok(())
    }
}

/// A Python module implemented in Rust.
#[pymodule]
fn rust_ext(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<LockFreeHashMap>()?;
    Ok(())
} 