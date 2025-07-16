(* HP Query Planner - OCaml Library *)
(* This module demonstrates functional programming concepts including:
   - Algebraic data types
   - Pattern matching
   - List.map and List.filter
   - Functors for extensibility
   - Monadic error handling *)

(* Algebraic data type for query expressions *)
type query_expr =
  | And of query_expr * query_expr
  | Or of query_expr * query_expr
  | Not of query_expr
  | Term of string
  | Literal of bool

(* Document representation *)
type document = {
  id: int;
  content: string;
  tags: string list;
}

(* Error handling using Result type (monadic) *)
type 'a result = Ok of 'a | Error of string

(* Functor for ranking strategies *)
module type RankingStrategy = sig
  type t
  val rank : document list -> query_expr -> (document * float) list
end

(* Default ranking strategy *)
module DefaultRanking : RankingStrategy = struct
  type t = unit
  
  let rank docs query =
    let rec score doc expr =
      match expr with
      | Term s -> 
          if List.mem s doc.tags || String.contains doc.content s.[0] then 1.0 else 0.0
      | And (e1, e2) -> 
          min (score doc e1) (score doc e2)
      | Or (e1, e2) -> 
          max (score doc e1) (score doc e2)
      | Not e -> 
          1.0 -. score doc e
      | Literal b -> 
          if b then 1.0 else 0.0
    in
    List.map (fun doc -> (doc, score doc query)) docs
end

(* Query planner functor *)
module QueryPlanner (Ranking : RankingStrategy) = struct
  
  (* Parse a simple boolean query string *)
  let parse_query s =
    (* Simple parser - in a real implementation, you'd use a proper parser *)
    let tokens = String.split_on_char ' ' s in
    let rec parse_tokens = function
      | [] -> Error "Empty query"
      | ["true"] -> Ok (Literal true)
      | ["false"] -> Ok (Literal false)
      | [term] -> Ok (Term term)
      | "AND" :: rest ->
          (match parse_tokens rest with
           | Ok expr -> Ok (And (Term "placeholder", expr))
           | Error e -> Error e)
      | "OR" :: rest ->
          (match parse_tokens rest with
           | Ok expr -> Ok (Or (Term "placeholder", expr))
           | Error e -> Error e)
      | "NOT" :: rest ->
          (match parse_tokens rest with
           | Ok expr -> Ok (Not expr)
           | Error e -> Error e)
      | _ -> Error "Invalid query syntax"
    in
    parse_tokens tokens

  (* Evaluate a query expression *)
  let rec eval_query docs expr =
    match expr with
    | Term s ->
        List.filter (fun doc -> 
          List.mem s doc.tags || String.contains doc.content s.[0]
        ) docs
    | And (e1, e2) ->
        let docs1 = eval_query docs e1 in
        let docs2 = eval_query docs e2 in
        List.filter (fun doc -> 
          List.mem doc docs1 && List.mem doc docs2
        ) docs
    | Or (e1, e2) ->
        let docs1 = eval_query docs e1 in
        let docs2 = eval_query docs e2 in
        List.append docs1 docs2
        |> List.sort_uniq (fun d1 d2 -> compare d1.id d2.id)
    | Not e ->
        let matching = eval_query docs e in
        List.filter (fun doc -> not (List.mem doc matching)) docs
    | Literal b ->
        if b then docs else []

  (* Apply ranking strategy *)
  let rank_results docs query =
    Ranking.rank docs query

  (* Main search function *)
  let search docs query_str =
    match parse_query query_str with
    | Error e -> Error e
    | Ok query ->
        let matching_docs = eval_query docs query in
        let ranked_docs = rank_results matching_docs query in
        Ok (List.map (fun (doc, score) -> doc.id) ranked_docs)

  (* Map over query results *)
  let map_results f docs query_str =
    match search docs query_str with
    | Error e -> Error e
    | Ok doc_ids -> Ok (List.map f doc_ids)

  (* Filter query results *)
  let filter_results p docs query_str =
    match search docs query_str with
    | Error e -> Error e
    | Ok doc_ids -> Ok (List.filter p doc_ids)
end

(* Example usage *)
module ExamplePlanner = QueryPlanner(DefaultRanking)

(* Sample documents *)
let sample_docs = [
  {id = 1; content = "apple pie recipe"; tags = ["apple"; "pie"; "recipe"]};
  {id = 2; content = "banana smoothie"; tags = ["banana"; "smoothie"]};
  {id = 3; content = "cherry tart"; tags = ["cherry"; "tart"]};
  {id = 4; content = "apple and banana salad"; tags = ["apple"; "banana"; "salad"]};
]

(* Example queries *)
let example_queries = [
  "apple";
  "banana OR cherry";
  "apple AND banana";
  "NOT cherry";
]

(* Test function *)
let test_queries () =
  List.iter (fun query_str ->
    Printf.printf "Query: %s\n" query_str;
    match ExamplePlanner.search sample_docs query_str with
    | Ok doc_ids -> 
        Printf.printf "  Results: [%s]\n" 
          (String.concat "; " (List.map string_of_int doc_ids))
    | Error e -> 
        Printf.printf "  Error: %s\n" e
  ) example_queries 