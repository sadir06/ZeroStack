#!/bin/bash

# OCaml Query Planner Runner
# This script runs the OCaml query planner and returns results as JSON

set -e

# Check if query is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <query>"
    exit 1
fi

QUERY="$1"

# Change to the OCaml project directory
cd "$(dirname "$0")/../../hp_query_planner"

# Build the OCaml project if needed
if [ ! -f "_build/default/query_planner.cma" ]; then
    echo "Building OCaml project..."
    dune build
fi

# Run the query planner (this would be the actual OCaml executable)
# For now, we'll simulate it with a simple response
echo "{\"query\": \"$QUERY\", \"results\": [1, 4, 7], \"scores\": [0.9, 0.7, 0.5]}" 