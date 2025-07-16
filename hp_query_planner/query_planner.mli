(* HP Query Planner - OCaml Library Interface *)

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

(* Query planner functor *)
module QueryPlanner (Ranking : RankingStrategy) : sig
  val parse_query : string -> query_expr result
  val eval_query : document list -> query_expr -> document list
  val search : document list -> string -> int list result
  val map_results : (int -> 'a) -> document list -> string -> 'a list result
  val filter_results : (int -> bool) -> document list -> string -> int list result
end

(* Example usage *)
module ExamplePlanner : sig
  val search : document list -> string -> int list result
  val test_queries : unit -> unit
end 