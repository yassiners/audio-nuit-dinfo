import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingOverlayProps {
  status: string;
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ status }) => {
  return (
    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full animate-pulse"></div>
        <Loader2 className="w-16 h-16 text-indigo-400 animate-spin relative z-10" />
      </div>
      <h3 className="mt-8 text-xl font-semibold text-white tracking-wide">Processing Audio</h3>
      <p className="mt-2 text-slate-400 text-sm font-mono">{status}</p>
      
      {/* Mock Terminal Output */}
      <div className="mt-8 w-64 bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-xs text-green-400/80 overflow-hidden">
        <div className="space-y-1">
          <p>> Ingesting stream...</p>
          <p className="delay-75 animate-pulse">> Running DSP analysis...</p>
          <p className="opacity-50">_</p>
        </div>
      </div>
    </div>
  );
};

export default ProcessingOverlay;