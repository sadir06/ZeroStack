import csv
import os
from sqlmodel import SQLModel, Session, create_engine, Field

class Document(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    content: str
    tags: str

sqlite_url = "sqlite:///./documents.db"
engine = create_engine(sqlite_url, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def load_csv(csv_path, content_col, tags_col, id_col=None, start_id=1):
    docs = []
    with open(csv_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader, start=start_id):
            doc_id = int(row[id_col]) if id_col and row.get(id_col) else i
            content = row[content_col]
            tags = row[tags_col].replace(" ", ",") if tags_col in row else ""
            docs.append(Document(id=doc_id, content=content, tags=tags))
    with Session(engine) as session:
        for doc in docs:
            if not session.get(Document, doc.id):
                session.add(doc)
        session.commit()
    print(f"Loaded {len(docs)} documents from {csv_path}")

def main():
    create_db_and_tables()
    base = os.path.join(os.path.dirname(__file__), "datasets")
    datasets = [
        # (filename, content_col, tags_col, id_col)
        ("wikipedia_sample.csv", "summary", "title", "id"),
        ("gutenberg_books.csv", "summary", "title", "id"),
        ("stackoverflow_questions.csv", "body", "tags", "id"),
        ("news_headlines.csv", "headline_text", "headline_text", ""),
        ("openlibrary_books.csv", "description", "subjects", "id"),
    ]
    start_id = 1
    for fname, content_col, tags_col, id_col in datasets:
        path = os.path.join(base, fname)
        if os.path.exists(path):
            load_csv(path, content_col, tags_col, id_col, start_id)
            start_id += 100000  # Offset IDs for each dataset
        else:
            print(f"Dataset not found: {path}")

if __name__ == "__main__":
    main() 