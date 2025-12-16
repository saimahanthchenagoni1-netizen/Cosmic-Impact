import React, { useState, useEffect } from 'react';
import { AsteroidInput, AnalysisResult, HistoryItem } from './types';
import { DEFAULT_INPUT, ASTEROID_TYPES } from './constants';
import { analyzeAsteroid } from './services/geminiService';
import StarBackground from './components/StarBackground';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Rocket, History as HistoryIcon, Calculator, ChevronRight, RefreshCw, X } from 'lucide-react';

const App: React.FC = () => {
  const [input, setInput] = useState<AsteroidInput>(DEFAULT_INPUT);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInput(prev => ({
      ...prev,
      [name]: name === 'diameter' || name === 'velocity' || name === 'distance' 
        ? parseFloat(value) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!process.env.API_KEY) {
      alert("API Key is missing. Please restart the environment with a valid API Key.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeAsteroid(input);
      setResult(data);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        input: { ...input },
        result: data
      };
      
      setHistory(prev => [newHistoryItem, ...prev]);
    } catch (error) {
      alert("Failed to analyze asteroid data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setInput(item.input);
    setResult(item.result);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      <StarBackground />
      
      {/* Mobile History Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 right-4 z-50 p-3 bg-slate-800/80 backdrop-blur rounded-full border border-slate-700 lg:hidden shadow-lg"
      >
        <HistoryIcon size={20} />
      </button>

      {/* Sidebar History (Drawer on mobile, fixed on desktop) */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-slate-950/90 backdrop-blur-xl border-l border-slate-800 transform transition-transform duration-300 z-40 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-display font-bold text-purple-400">Analysis Logs</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {history.length === 0 ? (
              <div className="text-center text-slate-600 mt-10">
                <HistoryIcon size={48} className="mx-auto mb-3 opacity-20" />
                <p>No previous scans.</p>
              </div>
            ) : (
              history.map(item => (
                <button 
                  key={item.id}
                  onClick={() => loadHistoryItem(item)}
                  className="w-full text-left p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500 hover:bg-slate-800 transition-all group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-white text-sm group-hover:text-purple-300">{item.input.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${item.result.isHit ? 'bg-red-900/50 text-red-400' : 'bg-emerald-900/50 text-emerald-400'}`}>
                      {item.result.isHit ? 'HIT' : 'MISS'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                     E: {item.result.kineticEnergyMegatons.toFixed(1)} MT
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:mr-80 min-h-screen">
        <header className="pt-8 px-6 md:px-12 pb-6 border-b border-slate-800/50 bg-slate-950/30 sticky top-0 z-30 backdrop-blur-sm">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-purple-900/20">
               <Rocket className="text-white" size={28} />
             </div>
             <div>
               <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">
                 COSMIC IMPACT
               </h1>
               <p className="text-xs text-purple-400 uppercase tracking-[0.2em] font-bold">Dimensional Analysis Engine</p>
             </div>
          </div>
        </header>

        <main className="p-6 md:p-12 max-w-7xl mx-auto">
          
          {/* Input Section */}
          <section className="mb-12">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
               <div className="flex items-center gap-2 mb-6 text-slate-300">
                 <Calculator size={20} />
                 <h2 className="text-lg font-display uppercase font-bold">Input Telemetry</h2>
               </div>

               <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase font-bold ml-1">Asteroid Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={input.name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase font-bold ml-1">Diameter (meters)</label>
                    <input 
                      type="number" 
                      name="diameter"
                      value={input.diameter}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm"
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase font-bold ml-1">Velocity (km/s)</label>
                    <input 
                      type="number" 
                      name="velocity"
                      value={input.velocity}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-mono text-sm"
                      min="0.1"
                      step="0.1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase font-bold ml-1">Distance (km)</label>
                    <input 
                      type="number" 
                      name="distance"
                      value={input.distance}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono text-sm"
                      min="0"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2 lg:col-span-2">
                     <label className="text-xs text-slate-500 uppercase font-bold ml-1">Composition Type</label>
                     <select 
                        name="type" 
                        value={input.type} 
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm appearance-none cursor-pointer"
                     >
                       {ASTEROID_TYPES.map(type => (
                         <option key={type.value} value={type.value}>{type.label}</option>
                       ))}
                     </select>
                  </div>

                  <div className="md:col-span-2 lg:col-span-2 flex items-end">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-purple-900/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="animate-spin" size={20} />
                          <span>Processing Physics...</span>
                        </>
                      ) : (
                        <>
                          <span>Run Analysis</span>
                          <ChevronRight size={20} />
                        </>
                      )}
                    </button>
                  </div>
               </form>
            </div>
          </section>

          {/* Results Section */}
          <section>
            <ResultsDisplay result={result} />
          </section>

        </main>
      </div>
    </div>
  );
};

export default App;