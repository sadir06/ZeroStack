import React, { useState } from "react";

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

const BACKEND_URL = "http://localhost:8000/search";
const DOC_URL = "http://localhost:8000/documents/";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults([]);
    setScores([]);
    setDocs([]);
    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, top_k: 10 }),
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

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-black via-indigo-950 to-gray-900 overflow-x-hidden">
      <ParticleBG />
      {/* Hero Section */}
      <div className="w-full max-w-4xl mx-auto mt-24 mb-12 p-12 rounded-3xl glass-card shadow-2xl border border-indigo-400/30 relative animate-fade-in">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-40 rounded-full blur-2xl animate-pulse-slow" />
        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 text-center drop-shadow-2xl animate-glow tracking-tight mb-4">ZeroStack</h1>
        <p className="text-center text-2xl text-indigo-100/90 mb-10 font-semibold animate-fade-in">Supercharged LLM Search Engine Demo</p>
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
            className="px-12 py-5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-2xl shadow-2xl hover:scale-105 hover:from-pink-600 hover:to-indigo-600 font-extrabold text-2xl transition-all duration-300 animate-bounce neon-btn"
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
                    <span className="text-3xl font-extrabold text-pink-400 group-hover:text-indigo-300 transition-colors duration-200 drop-shadow-lg">{doc.tags[0]}</span>
                    {scores[i] !== undefined && (
                      <span className="bg-indigo-400/30 text-indigo-100 px-6 py-2 rounded-full text-lg font-bold shadow group-hover:bg-pink-400/40 transition-colors duration-200 ml-auto neon-score">Score: {scores[i].toFixed(3)}</span>
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
      <footer className="text-indigo-300 text-lg text-center mb-8 animate-fade-in font-mono tracking-wide">ZeroStack &copy; {new Date().getFullYear()} &mdash; High-Performance LLM Search Demo</footer>
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
      `}</style>
    </div>
  );
}

export default App; 