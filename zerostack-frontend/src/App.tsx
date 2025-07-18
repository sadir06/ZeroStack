import React, { useState, useRef } from "react";

// Animated SVG background particles
const ParticleBG = () => (
  <svg className="absolute inset-0 w-full h-full -z-10" style={{ pointerEvents: 'none' }}>
    <defs>
      <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f472b6" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#a21caf" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="20%" cy="30%" r="180" fill="url(#glow1)" className="animate-pulse" />
    <circle cx="80%" cy="70%" r="140" fill="url(#glow2)" className="animate-pulse-slow" />
    <circle cx="60%" cy="20%" r="100" fill="url(#glow1)" className="animate-pulse-slower" />
    <circle cx="30%" cy="80%" r="120" fill="url(#glow2)" className="animate-pulse" />
  </svg>
);

const BACKEND_URL = "http://localhost:8000";
const SEARCH_URL = `${BACKEND_URL}/search`;
const DOC_URL = `${BACKEND_URL}/documents/`;
const UPLOAD_URL = `${BACKEND_URL}/upload`;
const DATASETS_URL = `${BACKEND_URL}/datasets`;

interface Dataset {
  id: number;
  name: string;
  data_type: string;
  total_records: number;
  created_at: string;
  file_size?: number;
}

interface UploadResponse {
  dataset_id: number;
  name: string;
  data_type: string;
  total_records: number;
  format_detected: any;
  sample_records: any[];
}

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'text'>('file');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState<UploadResponse | null>(null);
  const [datasetName, setDatasetName] = useState("");
  const [textData, setTextData] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Dataset management
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<number | null>(null);
  const [showDatasets, setShowDatasets] = useState(false);

  const loadDatasets = async () => {
    try {
      const response = await fetch(DATASETS_URL);
      if (response.ok) {
        const data = await response.json();
        setDatasets(data);
      }
    } catch (err) {
      console.error("Failed to load datasets:", err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults([]);
    setScores([]);
    setDocs([]);
    try {
      const searchPayload = {
        query,
        top_k: 10,
        dataset_id: selectedDataset
      };
      
      const res = await fetch(SEARCH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchPayload),
      });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data.results || []);
      setScores(data.scores || []);
      // Fetch document details for each result
      const docDetails = await Promise.all(
        (data.results || []).map(async (id: number) => {
          const docRes = await fetch(DOC_URL + id);
          if (!docRes.ok) return null;
          return await docRes.json();
        })
      );
      setDocs(docDetails);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDatasetName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension for default name
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datasetName.trim()) {
      setUploadError("Dataset name is required");
      return;
    }

    if (uploadMethod === 'file' && !selectedFile) {
      setUploadError("Please select a file");
      return;
    }

    if (uploadMethod === 'text' && !textData.trim()) {
      setUploadError("Please enter some text data");
      return;
    }

    setUploadLoading(true);
    setUploadError("");
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append('dataset_name', datasetName);

      if (uploadMethod === 'file' && selectedFile) {
        formData.append('file', selectedFile);
      } else if (uploadMethod === 'text') {
        formData.append('text_data', textData);
      }

      const response = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const result = await response.json();
      setUploadSuccess(result);
      
      // Reset form
      setDatasetName("");
      setTextData("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Reload datasets
      await loadDatasets();
      
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploadLoading(false);
    }
  };

  const resetUpload = () => {
    setShowUpload(false);
    setUploadMethod('file');
    setUploadLoading(false);
    setUploadError("");
    setUploadSuccess(null);
    setDatasetName("");
    setTextData("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Load datasets on component mount
  React.useEffect(() => {
    loadDatasets();
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-black via-indigo-950 to-gray-900 overflow-x-hidden">
      <ParticleBG />
      
      {/* Header with Navigation */}
      <div className="w-full max-w-6xl mx-auto mt-8 mb-6 px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 drop-shadow-2xl animate-glow tracking-tight">
            ZeroStack
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowDatasets(!showDatasets)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:scale-105 transition-all duration-300 font-bold"
            >
              {showDatasets ? 'Hide' : 'Show'} Datasets ({datasets.length})
            </button>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:scale-105 transition-all duration-300 font-bold"
            >
              {showUpload ? 'Cancel' : 'Upload'} Dataset
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Selection */}
      {showDatasets && (
        <div className="w-full max-w-6xl mx-auto mb-6 p-6 rounded-2xl glass-card border border-indigo-400/30">
          <h2 className="text-2xl font-bold text-indigo-200 mb-4">Available Datasets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                selectedDataset === null 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                  : 'bg-white/10 text-indigo-200 hover:bg-white/20'
              }`}
              onClick={() => setSelectedDataset(null)}
            >
              <h3 className="font-bold text-lg">Default Dataset</h3>
              <p className="text-sm opacity-80">Pre-loaded sample data</p>
            </div>
            {datasets.map((dataset) => (
              <div 
                key={dataset.id}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedDataset === dataset.id 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                    : 'bg-white/10 text-indigo-200 hover:bg-white/20'
                }`}
                onClick={() => setSelectedDataset(dataset.id)}
              >
                <h3 className="font-bold text-lg">{dataset.name}</h3>
                <p className="text-sm opacity-80">
                  {dataset.total_records} records • {dataset.data_type}
                </p>
                <p className="text-xs opacity-60">
                  {new Date(dataset.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Interface */}
      {showUpload && (
        <div className="w-full max-w-4xl mx-auto mb-6 p-8 rounded-2xl glass-card border border-indigo-400/30">
          <h2 className="text-3xl font-bold text-indigo-200 mb-6 text-center">Upload Your Dataset</h2>
          
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Upload Method Selection */}
            <div className="flex gap-4 justify-center mb-6">
              <button
                type="button"
                onClick={() => setUploadMethod('file')}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  uploadMethod === 'file'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    : 'bg-white/10 text-indigo-200 hover:bg-white/20'
                }`}
              >
                📁 Upload File
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('text')}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  uploadMethod === 'text'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-white/10 text-indigo-200 hover:bg-white/20'
                }`}
              >
                📝 Paste Text
              </button>
            </div>

            {/* Dataset Name */}
            <div>
              <label className="block text-indigo-200 font-bold mb-2">Dataset Name</label>
              <input
                type="text"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-indigo-400/30 text-indigo-100 placeholder-indigo-300/60 focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="Enter a name for your dataset"
                required
              />
            </div>

            {/* File Upload */}
            {uploadMethod === 'file' && (
              <div>
                <label className="block text-indigo-200 font-bold mb-2">Select File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".csv,.txt,.json"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-indigo-400/30 text-indigo-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"
                />
                <p className="text-sm text-indigo-300/60 mt-2">
                  Supported formats: CSV, TXT, JSON. We'll automatically detect the format!
                </p>
              </div>
            )}

            {/* Text Paste */}
            {uploadMethod === 'text' && (
              <div>
                <label className="block text-indigo-200 font-bold mb-2">Paste Your Data</label>
                <textarea
                  value={textData}
                  onChange={(e) => setTextData(e.target.value)}
                  className="w-full h-48 px-4 py-3 rounded-xl bg-white/10 border border-indigo-400/30 text-indigo-100 placeholder-indigo-300/60 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                  placeholder="Paste your data here... CSV, JSON, or just plain text - we'll figure it out!"
                  required
                />
                <p className="text-sm text-indigo-300/60 mt-2">
                  Paste any format: CSV, JSON, or unstructured text. We'll intelligently parse it!
                </p>
              </div>
            )}

            {/* Error Message */}
            {uploadError && (
              <div className="p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300">
                {uploadError}
              </div>
            )}

            {/* Success Message */}
            {uploadSuccess && (
              <div className="p-4 bg-green-500/20 border border-green-400/30 rounded-xl text-green-300">
                <h3 className="font-bold text-lg mb-2">✅ Upload Successful!</h3>
                <p>Dataset "{uploadSuccess.name}" created with {uploadSuccess.total_records} records.</p>
                <p className="text-sm opacity-80 mt-1">
                  Format detected: {uploadSuccess.format_detected.type} 
                  (confidence: {(uploadSuccess.format_detected.confidence * 100).toFixed(1)}%)
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                type="submit"
                disabled={uploadLoading}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="loader ease-linear rounded-full border-4 border-t-4 border-pink-400 h-6 w-6 animate-spin"></span>
                    Processing...
                  </span>
                ) : (
                  'Upload Dataset'
                )}
              </button>
              <button
                type="button"
                onClick={resetUpload}
                className="px-8 py-3 bg-white/10 text-indigo-200 rounded-xl font-bold hover:bg-white/20 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Hero Section */}
      <div className="w-full max-w-4xl mx-auto mb-12 p-12 rounded-3xl glass-card shadow-2xl border border-indigo-400/30 relative animate-fade-in">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-40 rounded-full blur-2xl animate-pulse-slow" />
        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 text-center drop-shadow-2xl animate-glow tracking-tight mb-4">ZeroStack</h1>
        <p className="text-center text-2xl text-indigo-100/90 mb-10 font-semibold animate-fade-in">
          Supercharged LLM Search Engine Demo
          {selectedDataset && (
            <span className="block text-lg text-pink-300 mt-2">
              Searching in: {datasets.find(d => d.id === selectedDataset)?.name || 'Unknown Dataset'}
            </span>
          )}
        </p>
        
        {/* Animated Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-4 mb-10 justify-center animate-fade-in relative z-10">
          <input
            className="flex-1 px-10 py-5 rounded-2xl shadow-2xl border-2 border-indigo-400 focus:outline-none focus:ring-4 focus:ring-pink-400/40 text-2xl transition-all duration-300 bg-white/20 placeholder-indigo-300/80 font-bold text-indigo-100 backdrop-blur-xl neon-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search LLMs, AI, architectures, safety, etc."
            disabled={loading}
            autoFocus
          />
          <button
            className="px-12 py-5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-2xl shadow-2xl hover:scale-105 hover:from-pink-600 hover:to-indigo-600 hover:animate-bounce-subtle font-extrabold text-2xl transition-all duration-300 neon-btn"
            type="submit"
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="loader ease-linear rounded-full border-4 border-t-4 border-pink-400 h-8 w-8 animate-spin"></span>
                Searching...
              </span>
            ) : (
              <span>Search</span>
            )}
          </button>
        </form>
        {error && <div className="text-pink-400 text-center mb-4 animate-fade-in font-bold text-lg">{error}</div>}
        
        {/* Results */}
        <div className="w-full animate-fade-in mt-8">
          <h2 className="text-4xl font-extrabold mb-7 text-indigo-200 text-center tracking-tight">Results</h2>
          {docs.length === 0 && !loading && (
            <div className="text-indigo-300 text-center text-xl">No results yet. Try a search!</div>
          )}
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {docs.map((doc, i) =>
              doc ? (
                <li key={i} className="relative py-8 px-8 bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl border border-indigo-400/40 group hover:scale-[1.03] hover:shadow-pink-400/40 hover:border-pink-400/60 transition-transform duration-300 animate-fade-in flex flex-col gap-3 neon-card">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-3xl font-extrabold text-pink-400 group-hover:text-indigo-300 transition-colors duration-200 drop-shadow-lg">
                      {doc.tags[0] || 'Data'}
                    </span>
                    {scores[i] !== undefined && (
                      <span className="bg-indigo-400/30 text-indigo-100 px-6 py-2 rounded-full text-lg font-bold shadow group-hover:bg-pink-400/40 transition-colors duration-200 ml-auto neon-score">
                        Score: {scores[i].toFixed(3)}
                      </span>
                    )}
                  </div>
                  <div className="text-xl text-indigo-100 font-semibold mt-1 mb-2 drop-shadow-sm">{doc.content}</div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 opacity-30 rounded-full blur-2xl group-hover:opacity-60 transition-opacity duration-300" />
                </li>
              ) : null
            )}
          </ul>
        </div>
      </div>
      
      <footer className="text-indigo-300 text-lg text-center mb-8 animate-fade-in font-mono tracking-wide">
        ZeroStack &copy; {new Date().getFullYear()} &mdash; High-Performance LLM Search Demo
      </footer>
      
      {/* Custom CSS for animations, glassmorphism, neon, and particles */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 8s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-pulse-slower {
          animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-fade-in {
          animation: fadeIn 1.2s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: none; }
        }
        .animate-glow {
          text-shadow: 0 0 32px #a5b4fc, 0 0 64px #f472b6, 0 0 128px #6366f1;
        }
        .loader {
          border-top-color: #f472b6;
          border-right-color: #a78bfa;
        }
        .glass-card {
          box-shadow: 0 12px 48px 0 rgba(31, 38, 135, 0.37);
          border-radius: 32px;
          border: 1.5px solid rgba(255, 255, 255, 0.18);
        }
        .neon-input {
          box-shadow: 0 0 16px #a5b4fc, 0 0 32px #f472b6;
        }
        .neon-btn {
          box-shadow: 0 0 24px #f472b6, 0 0 48px #a5b4fc;
        }
        .neon-card {
          box-shadow: 0 0 32px #a5b4fc, 0 0 64px #f472b6;
        }
        .neon-score {
          box-shadow: 0 0 12px #a5b4fc, 0 0 24px #f472b6;
        }
        .animate-bounce-subtle {
          animation: bounceSubtle 0.6s ease-in-out;
        }
        @keyframes bounceSubtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

export default App; 