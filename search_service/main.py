from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import subprocess
import json
import asyncio
import sys
import os
import csv
import io
import re
from datetime import datetime
from sqlmodel import SQLModel, Field, Session, create_engine, select

# Database models
class Document(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    content: str
    tags: str  # Comma-separated tags

class UserDataset(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    data_type: str  # 'structured', 'unstructured', 'mixed'
    total_records: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    file_size: Optional[int] = None

class DatasetRecord(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    dataset_id: int = Field(foreign_key="userdataset.id")
    content: str
    metadata: Optional[str] = None  # JSON string for additional data
    search_vector: Optional[str] = None  # Pre-processed for search
    created_at: datetime = Field(default_factory=datetime.utcnow)

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

def detect_data_format(raw_data: str) -> Dict[str, Any]:
    """Detect the format of uploaded data"""
    lines = raw_data.strip().split('\n')
    if not lines:
        return {"type": "unstructured", "confidence": 0.0}
    
    # Try to detect CSV-like format
    csv_patterns = [
        r'^[^,\n]+(?:,[^,\n]+)*$',  # Basic CSV
        r'^[^\t\n]+(?:\t[^\t\n]+)*$',  # TSV
        r'^[^;\n]+(?:;[^;\n]+)*$',  # Semicolon separated
    ]
    
    csv_matches = 0
    for line in lines[:10]:  # Check first 10 lines
        for pattern in csv_patterns:
            if re.match(pattern, line.strip()):
                csv_matches += 1
                break
    
    csv_confidence = csv_matches / min(len(lines), 10)
    
    # Try to detect JSON
    json_confidence = 0.0
    try:
        if raw_data.strip().startswith('[') and raw_data.strip().endswith(']'):
            json.loads(raw_data)
            json_confidence = 1.0
        elif raw_data.strip().startswith('{') and raw_data.strip().endswith('}'):
            json.loads(raw_data)
            json_confidence = 1.0
    except:
        pass
    
    # Determine the best format
    if json_confidence > 0.8:
        return {"type": "json", "confidence": json_confidence}
    elif csv_confidence > 0.6:
        return {"type": "csv", "confidence": csv_confidence, "delimiter": detect_delimiter(raw_data)}
    else:
        return {"type": "unstructured", "confidence": 1.0 - max(csv_confidence, json_confidence)}

def detect_delimiter(data: str) -> str:
    """Detect the most likely delimiter in CSV-like data"""
    lines = data.strip().split('\n')[:5]  # Check first 5 lines
    delimiters = [',', '\t', ';', '|']
    delimiter_counts = {delim: 0 for delim in delimiters}
    
    for line in lines:
        for delim in delimiters:
            delimiter_counts[delim] += line.count(delim)
    
    return max(delimiter_counts, key=delimiter_counts.get)

def parse_csv_data(data: str, delimiter: str = ',') -> List[Dict[str, str]]:
    """Parse CSV-like data into structured format"""
    lines = data.strip().split('\n')
    if not lines:
        return []
    
    # Try to parse as CSV
    try:
        csv_reader = csv.DictReader(io.StringIO(data), delimiter=delimiter)
        return [dict(row) for row in csv_reader]
    except:
        # Fallback: treat as simple delimited data
        headers = lines[0].split(delimiter)
        records = []
        for line in lines[1:]:
            values = line.split(delimiter)
            if len(values) == len(headers):
                record = dict(zip(headers, values))
                records.append(record)
        return records

def parse_json_data(data: str) -> List[Dict[str, Any]]:
    """Parse JSON data into structured format"""
    try:
        parsed = json.loads(data)
        if isinstance(parsed, list):
            return parsed
        elif isinstance(parsed, dict):
            return [parsed]
        else:
            return []
    except:
        return []

def parse_unstructured_data(data: str) -> List[Dict[str, str]]:
    """Parse unstructured text into searchable chunks"""
    # Split into paragraphs or sentences
    paragraphs = re.split(r'\n\s*\n', data.strip())
    records = []
    
    for i, para in enumerate(paragraphs):
        if para.strip():
            # Clean up the text
            cleaned = re.sub(r'\s+', ' ', para.strip())
            if len(cleaned) > 10:  # Only include meaningful chunks
                records.append({
                    "content": cleaned,
                    "chunk_id": i,
                    "type": "paragraph"
                })
    
    # If no paragraphs found, split by sentences
    if not records:
        sentences = re.split(r'[.!?]+', data.strip())
        for i, sentence in enumerate(sentences):
            cleaned = re.sub(r'\s+', ' ', sentence.strip())
            if len(cleaned) > 10:
                records.append({
                    "content": cleaned,
                    "chunk_id": i,
                    "type": "sentence"
                })
    
    return records

def process_uploaded_data(raw_data: str, dataset_name: str) -> Dict[str, Any]:
    """Process uploaded data and return structured results"""
    # Detect format
    format_info = detect_data_format(raw_data)
    
    # Parse based on detected format
    if format_info["type"] == "csv":
        delimiter = format_info.get("delimiter", ",")
        records = parse_csv_data(raw_data, delimiter)
        data_type = "structured"
    elif format_info["type"] == "json":
        records = parse_json_data(raw_data)
        data_type = "structured"
    else:
        records = parse_unstructured_data(raw_data)
        data_type = "unstructured"
    
    # Create dataset record
    with Session(engine) as session:
        dataset = UserDataset(
            name=dataset_name,
            data_type=data_type,
            total_records=len(records),
            file_size=len(raw_data.encode('utf-8'))
        )
        session.add(dataset)
        session.commit()
        session.refresh(dataset)
        
        # Add records
        for record in records:
            if isinstance(record, dict):
                content = record.get('content', str(record))
                metadata = json.dumps({k: v for k, v in record.items() if k != 'content'})
            else:
                content = str(record)
                metadata = None
            
            dataset_record = DatasetRecord(
                dataset_id=dataset.id,
                content=content,
                metadata=metadata,
                search_vector=content.lower()  # Simple search vector for now
            )
            session.add(dataset_record)
        
        session.commit()
    
    return {
        "dataset_id": dataset.id,
        "name": dataset.name,
        "data_type": data_type,
        "total_records": len(records),
        "format_detected": format_info,
        "sample_records": records[:3]  # First 3 records as preview
    }

def search_documents_in_db(query: str, dataset_id: Optional[int] = None) -> List[Document]:
    # Simple search: match if query is in content or tags
    with Session(engine) as session:
        if dataset_id:
            # Search in specific user dataset
            statement = select(DatasetRecord).where(DatasetRecord.dataset_id == dataset_id)
            results = session.exec(statement).all()
            query_lower = query.lower()
            return [
                Document(id=doc.id, content=doc.content, tags="user_dataset") 
                for doc in results
                if query_lower in doc.content.lower()
            ]
        else:
            # Search in default documents
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
    dataset_id: Optional[int] = None

class SearchResponse(BaseModel):
    results: List[int]
    scores: List[float]
    query: str
    total_found: int

class DocumentResponse(BaseModel):
    id: int
    content: str
    tags: List[str]

class UploadResponse(BaseModel):
    dataset_id: int
    name: str
    data_type: str
    total_records: int
    format_detected: Dict[str, Any]
    sample_records: List[Dict[str, Any]]

class DatasetInfo(BaseModel):
    id: int
    name: str
    data_type: str
    total_records: int
    created_at: datetime
    file_size: Optional[int]

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

@app.post("/upload", response_model=UploadResponse)
async def upload_dataset(
    file: Optional[UploadFile] = File(None),
    text_data: Optional[str] = Form(None),
    dataset_name: str = Form(...)
):
    """Upload a dataset via file or text paste"""
    try:
        if file:
            # Handle file upload
            content = await file.read()
            raw_data = content.decode('utf-8')
        elif text_data:
            # Handle text paste
            raw_data = text_data
        else:
            raise HTTPException(status_code=400, detail="Either file or text_data must be provided")
        
        if not raw_data.strip():
            raise HTTPException(status_code=400, detail="No data provided")
        
        # Process the uploaded data
        result = process_uploaded_data(raw_data, dataset_name)
        return UploadResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.get("/datasets", response_model=List[DatasetInfo])
async def list_datasets():
    """List all user-uploaded datasets"""
    with Session(engine) as session:
        datasets = session.exec(select(UserDataset)).all()
        return [DatasetInfo(**dataset.dict()) for dataset in datasets]

@app.post("/search", response_model=SearchResponse)
async def search_documents(request: SearchRequest):
    try:
        docs = search_documents_in_db(request.query, request.dataset_id)
        initial_doc_ids = [doc.id for doc in docs]
        if not initial_doc_ids:
            return SearchResponse(results=[], scores=[], query=request.query, total_found=0)
        
        # Get documents from hash map or database
        if request.dataset_id:
            # Search in user dataset
            with Session(engine) as session:
                dataset_records = session.exec(
                    select(DatasetRecord).where(DatasetRecord.id.in_(initial_doc_ids))
                ).all()
                documents = [
                    {"id": record.id, "content": record.content, "tags": ["user_dataset"]}
                    for record in dataset_records
                ]
        else:
            # Search in default documents
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
        # Try to find in user datasets
        with Session(engine) as session:
            record = session.get(DatasetRecord, doc_id)
            if record:
                return DocumentResponse(
                    id=record.id,
                    content=record.content,
                    tags=["user_dataset"]
                )
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