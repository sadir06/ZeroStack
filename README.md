# ZeroStack

A high-performance, multi-language search system combining Rust, C++, OCaml, Python, and GPU acceleration, deployed with Docker, Terraform, and Kubernetes.

## Project Structure

- **hp_data_structures/**: Rust data structures & GPU code
- **toy_kernel/**: C++ toy OS kernel
- **hp_query_planner/**: OCaml query planner
- **search_service/**: Python FastAPI service (integrates Rust & OCaml)
- **terraform/**, **k8s/**: Cloud deployment configs
- **.github/workflows/**: CI/CD pipeline

## Quick Start

**Rust:**
```bash
cd hp_data_structures
cargo build && cargo test
```

**OCaml:**
```bash
cd hp_query_planner
opam install dune base
```

**Python:**
```bash
cd search_service
pip install -r requirements.txt
python main.py
```

**Docker Compose:**
```bash
docker-compose up --build
```

**Cloud:**
- Use Terraform and Kubernetes configs in `terraform/` and `k8s/`.

---
For more details, see the respective subdirectory READMEs or code comments. 