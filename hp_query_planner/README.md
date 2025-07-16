# HP Query Planner - OCaml Library

This library demonstrates functional programming concepts in OCaml, including algebraic data types, pattern matching, List.map/filter operations, functors for extensibility, and monadic error handling.

## Functional Programming Concepts Demonstrated

### 1. Algebraic Data Types

The library uses algebraic data types to represent query expressions:

```ocaml
type query_expr =
  | And of query_expr * query_expr
  | Or of query_expr * query_expr
  | Not of query_expr
  | Term of string
  | Literal of bool
```

This allows us to represent complex boolean queries like `apple AND (banana OR cherry)` as a tree structure.

### 2. Pattern Matching

Pattern matching is used extensively to process query expressions:

```ocaml
let rec eval_query docs expr =
  match expr with
  | Term s -> (* handle single terms *)
  | And (e1, e2) -> (* handle AND operations *)
  | Or (e1, e2) -> (* handle OR operations *)
  | Not e -> (* handle NOT operations *)
  | Literal b -> (* handle boolean literals *)
```

### 3. List.map and List.filter

The library demonstrates functional list processing:

```ocaml
(* List.map: transform each element *)
List.map (fun doc -> (doc, score doc query)) docs

(* List.filter: select elements that match a predicate *)
List.filter (fun doc -> List.mem s doc.tags) docs
```

### 4. Functors for Extensibility

The library uses functors to allow pluggable ranking strategies:

```ocaml
module type RankingStrategy = sig
  type t
  val rank : document list -> query_expr -> (document * float) list
end

module QueryPlanner (Ranking : RankingStrategy) = struct
  (* Implementation that uses the ranking strategy *)
end
```

This allows different ranking algorithms to be swapped in without changing the core query logic.

### 5. Monadic Error Handling

The library uses the Result type for monadic error handling:

```ocaml
type 'a result = Ok of 'a | Error of string

let search docs query_str =
  match parse_query query_str with
  | Error e -> Error e
  | Ok query ->
      let matching_docs = eval_query docs query in
      Ok (List.map (fun (doc, score) -> doc.id) ranked_docs)
```

This ensures errors are properly propagated and handled throughout the computation.

## Usage Example

```ocaml
open Hp_query_planner

(* Sample documents *)
let docs = [
  {id = 1; content = "apple pie"; tags = ["apple"; "pie"]};
  {id = 2; content = "banana smoothie"; tags = ["banana"; "smoothie"]};
]

(* Search for documents *)
match ExamplePlanner.search docs "apple AND pie" with
| Ok doc_ids -> 
    Printf.printf "Found documents: %s\n" 
      (String.concat ", " (List.map string_of_int doc_ids))
| Error e -> 
    Printf.printf "Error: %s\n" e
```

## Building

```bash
# Install dependencies
opam install dune base

# Build the library
dune build

# Run tests
dune runtest
```

## Key Benefits

1. **Type Safety**: Algebraic data types ensure all query structures are valid at compile time
2. **Extensibility**: Functors allow ranking strategies to be swapped without code changes
3. **Error Handling**: Monadic Result type ensures errors are properly handled
4. **Functional Style**: Immutable data structures and pure functions make code easier to reason about
5. **Pattern Matching**: Exhaustive pattern matching catches all cases at compile time 