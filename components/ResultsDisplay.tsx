import React from 'react';
import { AnalysisResult } from '../types';
import { DimensionalStepCard } from './DimensionalStepCard';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AlertTriangle, CheckCircle, Activity, Globe, Zap } from 'lucide-react';

interface Props {
  result: AnalysisResult | null;
}

export const ResultsDisplay: React.FC<Props> = ({ result }) => {
  if (!result) {
    return (
      <div className="h-full flex items-center justify-center flex-col text-slate-500 p-10 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
        <Globe size={64} className="mb-4 opacity-50 animate-pulse" />
        <p className="text-xl font-display uppercase tracking-widest">Awaiting Telemetry Data</p>
        <p className="text-sm mt-2">Enter asteroid parameters to begin dimensional analysis.</p>
      </div>
    );
  }

  const impactColor = result.impactProbability > 50 ? 'text-red-500' : 'text-emerald-500';
  const ImpactIcon = result.impactProbability > 50 ? AlertTriangle : CheckCircle;

  // Data for Crater Size comparison chart (log scale visual approximation)
  const craterData = [
    { name: 'Barringer Crater', size: 1200 },
    { name: 'This Impact', size: result.craterSizeMeters },
    { name: 'Chicxulub', size: 150000 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Summary Banner */}
      <div className={`relative overflow-hidden rounded-3xl p-1 bg-gradient-to-r ${result.isHit ? 'from-red-600 via-orange-500 to-red-600' : 'from-emerald-500 via-cyan-500 to-emerald-500'}`}>
        <div className="bg-slate-950 rounded-[22px] p-6 md:p-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ImpactIcon size={32} className={result.isHit ? 'text-red-500' : 'text-emerald-500'} />
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white uppercase">
                  {result.isHit ? 'Impact Warning' : 'Safe Trajectory'}
                </h2>
              </div>
              <p className="text-slate-400 max-w-xl">{result.analysisSummary}</p>
            </div>
            <div className="text-right bg-slate-900/50 p-4 rounded-xl border border-slate-800 min-w-[150px]">
              <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Probability</div>
              <div className={`text-4xl font-mono font-bold ${impactColor}`}>
                {result.impactProbability}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Dimensional Analysis Process */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-cyan-400" />
            <h3 className="text-xl font-display font-bold text-cyan-400 uppercase tracking-wider">
              Dimensional Analysis Process
            </h3>
          </div>
          
          <div className="bg-slate-900/30 p-6 rounded-3xl border border-slate-800 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {result.dimensionalProcess.map((step, index) => (
              <DimensionalStepCard 
                key={index} 
                data={step} 
                index={index} 
                isLast={index === result.dimensionalProcess.length - 1} 
              />
            ))}
          </div>
        </div>

        {/* Right Column: Data Visualization */}
        <div className="space-y-8">
          {/* Energy Card */}
          <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="text-yellow-400" />
              <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider">Kinetic Energy Output</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-800/50 p-4 rounded-xl">
                <div className="text-xs text-slate-500 uppercase">Megatons (TNT)</div>
                <div className="text-2xl font-mono text-yellow-400 font-bold truncate" title={result.kineticEnergyMegatons.toString()}>
                  {result.kineticEnergyMegatons.toLocaleString(undefined, { maximumFractionDigits: 2 })} MT
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl">
                <div className="text-xs text-slate-500 uppercase">Hiroshima Equiv.</div>
                <div className="text-2xl font-mono text-orange-400 font-bold truncate">
                  ~{(result.kineticEnergyMegatons * 66).toLocaleString(undefined, { maximumFractionDigits: 0 })}x
                </div>
              </div>
            </div>
            
            {/* Composition Chart */}
            <div className="h-64 w-full mt-4">
               <p className="text-center text-sm text-slate-400 mb-2">Composition Analysis</p>
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={result.composition}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="percentage"
                     nameKey="element"
                   >
                     {result.composition.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(0,0,0,0)" />
                     ))}
                   </Pie>
                   <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                   />
                 </PieChart>
               </ResponsiveContainer>
               <div className="flex flex-wrap justify-center gap-3 mt-2">
                 {result.composition.map((c, i) => (
                   <div key={i} className="flex items-center gap-1 text-xs text-slate-300">
                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.fill }}></span>
                     {c.element} ({c.percentage}%)
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Crater Comparison */}
          <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-6">
            <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider mb-6">Crater Impact Size (m)</h3>
            <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={craterData} layout="vertical">
                   <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" width={100} tick={{fill: '#94a3b8', fontSize: 10}} />
                   <Tooltip 
                     cursor={{fill: 'rgba(255,255,255,0.05)'}}
                     contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                   />
                   <Bar dataKey="size" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={20} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};