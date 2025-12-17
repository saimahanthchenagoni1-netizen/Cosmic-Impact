import React, { useState } from 'react';
import { AsteroidInput, AnalysisResult, HistoryItem } from './types';
import { DEFAULT_INPUT, ASTEROID_TYPES } from './constants';
import { analyzeAsteroid } from './services/geminiService';
import StarBackground from './components/StarBackground';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Rocket, History as HistoryIcon, Calculator, ChevronRight, RefreshCw, X, Cpu } from 'lucide-react';

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
    setLoading(true);
    setResult(null);

    try {
      // Direct call to local physics engine - No API Key needed
      const data = await analyzeAsteroid(input);
      setResult(data);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        input: { ...input },
        result: data
      };
      
      setHistory(prev => [newHistoryItem, ...prev]);
    } catch (error) {
      console.error(error);
      alert("Physics engine computation error.");
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
    <div className="min-h-screen text-white overflow-x-hidden font-sans">
      <StarBackground />
      
      {/* Mobile History Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 right-4 z-50 p-3 bg-slate-800/80 backdrop-blur rounded-full border border-slate-700 lg:hidden shadow-lg hover:bg-slate-700 transition"
      >
        <HistoryIcon size={20} />
      </button>

      {/* Sidebar History */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 transform transition-transform duration-300 z-50 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-display font-bold text-cyan-400">Mission Logs</h2>
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
                  className="w-full text-left p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500 hover:bg-slate-800 transition-all group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-1 relative z-10">
                    <span className="font-bold text-white text-sm group-hover:text-cyan-300">{item.input.name}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${item.result.isHit ? 'bg-red-900/50 text-red-400' : 'bg-emerald-900/50 text-emerald-400'}`}>
                      {item.result.isHit ? 'IMPACT' : 'MISS'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono relative z-10">
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
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl shadow-lg shadow-cyan-900/20">
                 <Rocket className="text-white" size={28} />
               </div>
               <div>
                 <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200">
                   COSMIC IMPACT
                 </h1>
                 <p className="text-xs text-cyan-400 uppercase tracking-[0.2em] font-bold">Physics Engine v1.0</p>
               </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-700 text-xs text-slate-400">
                <Cpu size={14} />
                <span>Local Computation Ready</span>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-12 max-w-7xl mx-auto">
          
          {/* Input Section */}
          <section className="mb-12">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-2xl relative overflow-hidden">
               {/* Decorative background element */}
               <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
               
               <div className="flex items-center gap-2 mb-6 text-slate-300 relative z-10">
                 <Calculator size={20} />
                 <h2 className="text-lg font-display uppercase font-bold">Input Telemetry</h2>
               </div>

               <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                  
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase font-bold ml-1">Asteroid Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={input.name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm text-white"
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
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm text-white"
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
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm text-white"
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
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm text-white"
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
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm appearance-none cursor-pointer text-white"
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
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-cyan-900/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="animate-spin" size={20} />
                          <span>Calculating Physics...</span>
                        </>
                      ) : (
                        <>
                          <span>Engage Analysis</span>
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