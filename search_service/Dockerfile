# Multi-stage build for the search service
FROM rust:1.70 as rust-builder

# Build the Rust extension
WORKDIR /app/rust_ext
COPY rust_ext/ .
RUN cargo build --release

# Build the main Rust crate
WORKDIR /app/hp_data_structures
COPY hp_data_structures/ .
RUN cargo build --release

# OCaml stage
FROM ocaml/opam:ubuntu-22.04-ocaml-5.0 as ocaml-builder

# Install dependencies and build OCaml project
WORKDIR /app/hp_query_planner
COPY hp_query_planner/ .
RUN opam install dune base
RUN dune build

# Python stage
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Python requirements and install
COPY search_service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Rust extension
COPY --from=rust-builder /app/rust_ext/target/release/librust_ext.so ./rust_ext.so

# Copy OCaml executable
COPY --from=ocaml-builder /app/hp_query_planner/_build/default/query_planner.exe ./ocaml_planner

# Copy Python application
COPY search_service/ .

# Make OCaml planner executable
RUN chmod +x ./ocaml_planner

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 