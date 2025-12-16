import React from 'react';
import { DimensionalStep } from '../types';
import { ArrowDown } from 'lucide-react';

interface Props {
  data: DimensionalStep;
  index: number;
  isLast: boolean;
}

export const DimensionalStepCard: React.FC<Props> = ({ data, index, isLast }) => {
  return (
    <div className="relative flex flex-col items-center">
      <div className="w-full bg-slate-800/50 backdrop-blur-md border border-slate-700 p-4 rounded-xl hover:border-cyan-500 transition-colors duration-300">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-cyan-400 font-display font-bold text-sm uppercase tracking-wider">Step {index + 1}: {data.step}</h4>
        </div>
        
        <div className="bg-slate-900/80 p-3 rounded-lg font-mono text-sm md:text-base text-yellow-300 overflow-x-auto whitespace-nowrap mb-2 shadow-inner border border-slate-800">
          {data.equation}
        </div>
        
        <p className="text-slate-400 text-sm mb-2 italic">
          {data.explanation}
        </p>

        <div className="flex justify-end">
          <span className="text-emerald-400 font-bold font-mono bg-emerald-900/20 px-2 py-1 rounded">
            = {data.result}
          </span>
        </div>
      </div>
      
      {!isLast && (
        <div className="my-2 text-slate-600">
          <ArrowDown size={24} />
        </div>
      )}
    </div>
  );
};