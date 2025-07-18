# ZeroStack 🚀

**High-Performance LLM Search Engine with User Upload Capabilities**

ZeroStack is a modern, multi-language search engine platform that allows users to upload their own datasets and search through them with intelligent parsing and fast retrieval.

## ✨ Features

- **🔍 Smart Search**: Advanced search algorithms with fuzzy matching and multi-word support
- **📁 User Uploads**: Upload CSV, JSON, or unstructured text - we'll automatically detect the format!
- **⚡ High Performance**: Rust extensions for speed-critical operations
- **🎨 Modern UI**: Beautiful React frontend with Tailwind CSS
- **🔧 Multi-Language**: Python backend, Rust extensions, OCaml query planner
- **☁️ Cloud Ready**: Kubernetes and Terraform deployment support

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (3.8 or higher)
- **npm** (v8 or higher)

### Installation & Running

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ZeroStack
   ```

2. **Start everything with one command**
   ```bash
   npm run dev
   ```

   This will:
   - Install all dependencies (Node.js and Python)
   - Start the FastAPI backend on `http://localhost:8000`
   - Start the React frontend on `http://localhost:3000`
   - Open your browser automatically

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 📖 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both backend and frontend (development mode) |
| `npm run backend` | Start only the FastAPI backend |
| `npm run frontend` | Start only the React frontend |
| `npm run setup` | Install all dependencies |
| `npm run test` | Run upload functionality tests |
| `npm run build` | Build the frontend for production |
| `npm run clean` | Clean all dependencies and cache |

## 🎯 How to Use

### 1. Upload Your Dataset

**Option A: File Upload**
- Click "Upload Dataset" in the UI
- Select a CSV, TXT, or JSON file
- Give it a name and upload

**Option B: Text Paste**
- Click "Upload Dataset" → "Paste Text"
- Paste any data (CSV, JSON, or plain text)
- We'll automatically detect the format!

### 2. Search Your Data

- Select your uploaded dataset from the dataset list
- Enter your search query
- Get relevant results with confidence scores

### 3. Advanced Features

- **Fuzzy Search**: Handles typos and partial matches
- **Multi-word Queries**: Search for multiple terms
- **Format Detection**: Automatically detects CSV, JSON, or unstructured text
- **Smart Parsing**: Handles messy, real-world data

## 🏗️ Architecture

```
ZeroStack/
├── search_service/          # FastAPI backend
│   ├── main.py             # Main API server
│   ├── requirements.txt    # Python dependencies
│   └── datasets/           # Pre-loaded datasets
├── zerostack-frontend/     # React frontend
│   ├── src/App.tsx        # Main UI component
│   └── package.json       # Frontend dependencies
├── hp_data_structures/     # Rust extensions
├── hp_query_planner/       # OCaml query planner
├── k8s/                   # Kubernetes manifests
├── terraform/             # Infrastructure as Code
└── package.json           # Root project config
```

## 🔧 Technical Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLModel** - Database ORM
- **SQLite** - Database (easily switchable to PostgreSQL)
- **Uvicorn** - ASGI server

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Concurrently** - Run multiple processes

### Performance
- **Rust Extensions** - High-performance data structures
- **GPU Acceleration** - CUDA/WGSL support
- **OCaml Query Planner** - Advanced query optimization

### Infrastructure
- **Docker** - Containerization
- **Kubernetes** - Orchestration
- **Terraform** - Infrastructure as Code

## 📊 Database Schema

```sql
-- Default documents
CREATE TABLE document (
    id INTEGER PRIMARY KEY,
    content TEXT,
    tags TEXT
);

-- User uploaded datasets
CREATE TABLE userdataset (
    id INTEGER PRIMARY KEY,
    name TEXT,
    description TEXT,
    data_type TEXT,
    total_records INTEGER,
    created_at TIMESTAMP,
    file_size INTEGER
);

-- Dataset records
CREATE TABLE datasetrecord (
    id INTEGER PRIMARY KEY,
    dataset_id INTEGER,
    content TEXT,
    metadata TEXT,
    search_vector TEXT,
    created_at TIMESTAMP
);
```

## 🧪 Testing

Run the upload functionality tests:

```bash
npm run test
```

This will test:
- CSV file uploads
- JSON data uploads
- Unstructured text uploads
- Search functionality in uploaded datasets

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Docker Deployment
```bash
docker-compose up -d
```

### Kubernetes Deployment
```bash
kubectl apply -f k8s/
```

## 🔮 Roadmap

- [x] User dataset uploads
- [x] Smart format detection
- [x] Basic search functionality
- [ ] Advanced fuzzy search
- [ ] Multi-word query support
- [ ] Vector embeddings
- [ ] Real-time collaboration
- [ ] Advanced analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: Create a GitHub issue
- **Documentation**: Check the `/docs` folder
- **API Docs**: Visit `http://localhost:8000/docs` when running

---

**Built with ❤️ by the ZeroStack Team** 