"use client";

import { useState } from "react";

export default function IDSDashboard() {
  const [payload, setPayload] = useState("");
  const [result, setResult] = useState<{ probability: number; action: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Quick test payloads for the presentation
  const safeExample = "GET /index.php?user_id=123&session=active HTTP/1.1\nHost: www.tinzwave.com\nUser-Agent: Mozilla/5.0\nAccept: text/html";
  const maliciousExample = "POST /login.php HTTP/1.1\nHost: www.tinzwave.com\nContent-Type: application/x-www-form-urlencoded\n\nusername=admin' OR 1=1 --&password=hack";

  const analyzeTraffic = async () => {
    if (!payload.trim()) {
      setError("Please enter a payload to analyze.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    // Get the API URL from the .env.local file (Fallback to localhost if missing)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

    try {
      const response = await fetch(`${apiUrl}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload: payload }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to the IDS Engine.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("API Connection Error. Make sure the backend is running and the URL is correct.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="border-b border-slate-800 pb-6">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            AI Intrusion Detection <span className="text-blue-500">Engine</span>
          </h1>
          <p className="mt-2 text-slate-400">
            Real-time deep neural network analysis of HTTP traffic payloads.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Input Area */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Network Traffic Payload</h2>
              <div className="space-x-2">
                <button 
                  onClick={() => setPayload(safeExample)}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded transition"
                >
                  Load Safe
                </button>
                <button 
                  onClick={() => setPayload(maliciousExample)}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded transition"
                >
                  Load Attack
                </button>
              </div>
            </div>

            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              placeholder="Paste raw HTTP GET/POST request here..."
              className="w-full h-64 p-4 bg-slate-900 border border-slate-700 rounded-lg font-mono text-sm text-emerald-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-inner resize-none"
            />

            <button
              onClick={analyzeTraffic}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold text-white transition shadow-lg ${
                loading ? "bg-blue-800 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 active:scale-[0.98]"
              }`}
            >
              {loading ? "Analyzing Neural Pathways..." : "Scan Payload"}
            </button>

            {error && (
              <div className="p-4 bg-red-950/50 border border-red-900 text-red-400 rounded-lg text-sm">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Right Column: AI Analysis Results */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl flex flex-col justify-center">
            <h2 className="text-lg font-semibold text-slate-400 mb-6 uppercase tracking-wider text-center">
              System Assessment
            </h2>

            {!result && !loading && (
              <div className="flex-1 flex items-center justify-center text-slate-600">
                <p>Awaiting network traffic for analysis...</p>
              </div>
            )}

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-pulse">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-blue-400 font-mono">Processing tensor operations...</p>
              </div>
            )}

            {result && !loading && (
              <div className="flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-300">
                
                {/* Action Badge */}
                <div className={`px-12 py-4 rounded-full text-3xl font-black tracking-widest shadow-[0_0_40px_rgba(0,0,0,0.5)] ${
                  result.action === "BLOCK" 
                    ? "bg-red-500 text-white shadow-red-500/20" 
                    : "bg-emerald-500 text-white shadow-emerald-500/20"
                }`}>
                  {result.action}
                </div>

                {/* Probability Details */}
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-sm font-mono">
                    <span className="text-slate-400">Threat Probability:</span>
                    <span className={result.action === "BLOCK" ? "text-red-400" : "text-emerald-400"}>
                      {(result.probability * 100).toFixed(2)}%
                    </span>
                  </div>
                  
                  {/* Custom Progress Bar */}
                  <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${
                        result.action === "BLOCK" ? "bg-red-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.max(result.probability * 100, 2)}%` }}
                    />
                  </div>
                </div>

                {/* Cyber Context */}
                <div className="text-center text-sm text-slate-500">
                  {result.action === "BLOCK" 
                    ? "Anomaly detected. Payload structure matches known exploitation vectors (e.g., SQLi, XSS) learned from the CSIC-2010 dataset."
                    : "Payload conforms to standard HTTP structural baselines. No malicious anomalies detected."}
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}