# ZeroStack Development Guide 🛠️

## Quick Commands

### 🚀 Start Development
```bash
npm run dev
```

### 🔧 Individual Services
```bash
npm run backend    # Start only FastAPI backend
npm run frontend   # Start only React frontend
```

### 🧪 Testing
```bash
npm run test       # Run upload functionality tests
```

### 🏗️ Setup & Maintenance
```bash
npm run setup      # Install all dependencies
npm run clean      # Clean all dependencies and cache
npm run build      # Build frontend for production
```

## Development Workflow

### 1. Backend Development (Python/FastAPI)
- **Location**: `search_service/`
- **Main file**: `main.py`
- **Database**: SQLite (`documents.db`)
- **API Docs**: http://localhost:8000/docs

### 2. Frontend Development (React/TypeScript)
- **Location**: `zerostack-frontend/`
- **Main file**: `src/App.tsx`
- **Styling**: Tailwind CSS
- **Port**: http://localhost:3000

### 3. Rust Extensions
- **Location**: `hp_data_structures/`
- **Build**: `cargo build`
- **Test**: `cargo test`

### 4. OCaml Query Planner
- **Location**: `hp_query_planner/`
- **Build**: `dune build`
- **Test**: `dune runtest`

## API Endpoints

### Search
- `POST /search` - Search documents
- `GET /documents` - List all documents
- `GET /documents/{id}` - Get specific document

### Upload
- `POST /upload` - Upload dataset (file or text)
- `GET /datasets` - List user datasets

## Database Schema

### Tables
- `document` - Default documents
- `userdataset` - User uploaded datasets
- `datasetrecord` - Records in user datasets

### Adding New Tables
1. Add model to `main.py`
2. Run `create_db_and_tables()` on startup
3. Update search logic if needed

## Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Python dependencies missing**
```bash
cd search_service
python -m pip install -r requirements.txt
```

**Node modules missing**
```bash
cd zerostack-frontend
npm install
```

**Database issues**
```bash
# Remove database file to reset
rm search_service/documents.db
```

### Debug Mode

**Backend debugging**
```bash
cd search_service
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 --log-level debug
```

**Frontend debugging**
```bash
cd zerostack-frontend
REACT_APP_DEBUG=true npm start
```

## File Structure

```
ZeroStack/
├── search_service/          # Backend API
│   ├── main.py             # FastAPI server
│   ├── requirements.txt    # Python deps
│   ├── test_upload.py      # Upload tests
│   └── datasets/           # Sample data
├── zerostack-frontend/     # React frontend
│   ├── src/App.tsx        # Main component
│   ├── package.json       # Frontend deps
│   └── public/            # Static assets
├── hp_data_structures/     # Rust extensions
├── hp_query_planner/       # OCaml planner
├── k8s/                   # Kubernetes configs
├── terraform/             # Infrastructure
├── package.json           # Root config
├── start.bat             # Windows batch
├── start.ps1             # PowerShell script
└── README.md             # Main documentation
```

## Environment Variables

### Backend (.env in search_service/)
```env
DATABASE_URL=sqlite:///./documents.db
DEBUG=true
LOG_LEVEL=info
```

### Frontend (.env in zerostack-frontend/)
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_DEBUG=true
```

## Performance Tips

### Backend
- Use Rust extensions for heavy computations
- Implement caching for frequent queries
- Use async/await for I/O operations

### Frontend
- Implement virtual scrolling for large datasets
- Use React.memo for expensive components
- Optimize bundle size with code splitting

## Testing

### Backend Tests
```bash
cd search_service
python test_upload.py
```

### Frontend Tests
```bash
cd zerostack-frontend
npm test
```

### End-to-End Tests
```bash
# Start the application
npm run dev

# In another terminal, run tests
npm run test
```

## Deployment

### Local Production Build
```bash
npm run build
cd search_service
python main.py
```

### Docker
```bash
docker-compose up --build
```

### Kubernetes
```bash
kubectl apply -f k8s/
```

## Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Code Style

**Python (Backend)**
- Use Black for formatting
- Follow PEP 8
- Add type hints

**TypeScript (Frontend)**
- Use Prettier for formatting
- Follow ESLint rules
- Add proper types

**Rust (Extensions)**
- Use rustfmt for formatting
- Follow clippy suggestions
- Add comprehensive tests

---

**Happy Coding! 🎉** 