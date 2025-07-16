from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import subprocess
import json
import asyncio
import sys
import os
from sqlmodel import SQLModel, Field, Session, create_engine, select

# Database model
class Document(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    content: str
    tags: str  # Comma-separated tags

sqlite_url = "sqlite:///./documents.db"
engine = create_engine(sqlite_url, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def add_sample_documents():
    docs = [
        Document(id=1, content="apple pie recipe with cinnamon", tags="apple,pie,recipe,cinnamon"),
        Document(id=2, content="banana smoothie with berries", tags="banana,smoothie,berries"),
        Document(id=3, content="cherry tart with vanilla", tags="cherry,tart,vanilla"),
        Document(id=4, content="apple and banana salad", tags="apple,banana,salad"),
        Document(id=5, content="chocolate cake recipe", tags="chocolate,cake,recipe"),
        Document(id=6, content="strawberry ice cream", tags="strawberry,ice,cream"),
        Document(id=7, content="apple cinnamon muffins", tags="apple,cinnamon,muffins"),
        Document(id=8, content="banana bread with nuts", tags="banana,bread,nuts"),
    ]
    with Session(engine) as session:
        for doc in docs:
            if not session.get(Document, doc.id):
                session.add(doc)
        session.commit()

def search_documents_in_db(query: str) -> List[Document]:
    # Simple search: match if query is in content or tags
    with Session(engine) as session:
        statement = select(Document)
        results = session.exec(statement).all()
        query_lower = query.lower()
        return [
            doc for doc in results
            if query_lower in doc.content.lower() or query_lower in doc.tags.lower()
        ]

# Import the Rust extension (this would be built with PyO3)
try:
    from rust_ext import LockFreeHashMap
except ImportError:
    # Fallback for development
    class LockFreeHashMap:
        def __init__(self):
            self.data = {}
        def insert(self, key, value):
            self.data[key] = value
        def get(self, key):
            return self.data.get(key)

# Import GPU scoring (this would be the actual GPU module)
try:
    from hp_data_structures.gpu_score import GpuScorer
except ImportError:
    # Fallback for development
    class GpuScorer:
        async def new():
            return GpuScorer()
        def compute_softmax_and_top_k(self, input_data, k):
            import numpy as np
            exp_data = np.exp(input_data)
            softmax = exp_data / np.sum(exp_data)
            indices = np.argsort(softmax)[-k:][::-1]
            return indices.tolist()

app = FastAPI(title="HP Search Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
hash_map = LockFreeHashMap()
gpu_scorer = None

class SearchRequest(BaseModel):
    query: str
    top_k: int = 10

class SearchResponse(BaseModel):
    results: List[int]
    scores: List[float]
    query: str
    total_found: int

class DocumentResponse(BaseModel):
    id: int
    content: str
    tags: List[str]

@app.on_event("startup")
async def startup_event():
    global gpu_scorer, hash_map
    create_db_and_tables()
    add_sample_documents()
    try:
        gpu_scorer = await GpuScorer.new()
    except Exception as e:
        print(f"Warning: GPU scorer initialization failed: {e}")
        gpu_scorer = None
    # Load all documents into the hash map for fast access
    with Session(engine) as session:
        docs = session.exec(select(Document)).all()
        for doc in docs:
            hash_map.insert(doc.id, {"id": doc.id, "content": doc.content, "tags": doc.tags.split(",")})
    print("Search service initialized successfully")

@app.get("/")
async def root():
    return {"message": "HP Search Service is running", "version": "1.0.0"}

@app.post("/search", response_model=SearchResponse)
async def search_documents(request: SearchRequest):
    try:
        docs = search_documents_in_db(request.query)
        initial_doc_ids = [doc.id for doc in docs]
        if not initial_doc_ids:
            return SearchResponse(results=[], scores=[], query=request.query, total_found=0)
        # Get documents from hash map
        documents = [hash_map.get(doc_id) for doc_id in initial_doc_ids]
        # Compute embeddings (mock)
        import random
        random.seed(42)
        embeddings = [[random.uniform(-1, 1) for _ in range(1000)] for _ in initial_doc_ids]
        # Use GPU scoring for ranking
        if gpu_scorer and len(embeddings) > 0:
            import numpy as np
            scores = np.sum(embeddings, axis=1).tolist()
            top_k_indices = gpu_scorer.compute_softmax_and_top_k(scores, min(request.top_k, len(scores)))
            final_doc_ids = [initial_doc_ids[i] for i in top_k_indices]
            final_scores = [scores[i] for i in top_k_indices]
        else:
            final_doc_ids = initial_doc_ids[:request.top_k]
            final_scores = [1.0] * len(final_doc_ids)
        return SearchResponse(results=final_doc_ids, scores=final_scores, query=request.query, total_found=len(final_doc_ids))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/documents/{doc_id}", response_model=DocumentResponse)
async def get_document(doc_id: int):
    doc = hash_map.get(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentResponse(**doc)

@app.get("/documents", response_model=List[DocumentResponse])
async def list_documents():
    with Session(engine) as session:
        docs = session.exec(select(Document)).all()
        return [{"id": doc.id, "content": doc.content, "tags": doc.tags.split(",")} for doc in docs]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 