import React from 'react';
import { Download, CheckCircle, AlertTriangle, Play, FileText, Activity, Mail } from 'lucide-react';
import { AnalysisResult, ProcessedFile, ProcessingConfig } from '../types';

interface ResultsPanelProps {
  analysis: AnalysisResult;
  fileData: ProcessedFile;
  config: ProcessingConfig;
  onReset: () => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ analysis, fileData, config, onReset }) => {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full ${analysis.silenceDetected ? 'bg-rose-500/20 text-rose-400' : 'bg-green-500/20 text-green-400'}`}>
            {analysis.silenceDetected ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Processing Complete</h2>
            <div className="flex flex-col">
              <p className="text-slate-400 text-sm">
                {analysis.silenceDetected 
                  ? 'Issues detected in audio stream.' 
                  : 'Audio integrity verified.'}
              </p>
              {analysis.silenceDetected && analysis.silenceType === 'technical' && config.alertEmail && (
                <div className="flex items-center text-rose-400 text-xs mt-1 animate-pulse">
                  <Mail className="w-3 h-3 mr-1" />
                  Alert sent to {config.alertEmail}
                </div>
              )}
            </div>
          </div>
        </div>
        <button 
          onClick={onReset}
          className="text-sm text-slate-500 hover:text-white transition-colors"
        >
          Process New File
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: File Info & Download */}
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
              <Play className="w-4 h-4 mr-2" /> Output File
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-500 mb-1">Final Filename</p>
                <p className="font-mono text-indigo-300 break-all">{fileData.finalName}</p>
                <p className="text-xs text-slate-600 mt-2 font-mono">Path: {fileData.storagePath}</p>
              </div>
              
              <a 
                href={fileData.url} 
                download={fileData.finalName}
                className="flex items-center justify-center w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/25 group"
              >
                <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Download Processed Audio
              </a>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
              <Activity className="w-4 h-4 mr-2" /> Signal Analysis
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded hover:bg-slate-700/30 transition-colors">
                <span className="text-slate-400 text-sm">Duration</span>
                <span className="font-mono text-white">{analysis.duration.toFixed(2)}s</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded hover:bg-slate-700/30 transition-colors">
                <span className="text-slate-400 text-sm">Silence Detected</span>
                <span className={`font-mono font-bold ${analysis.silenceDetected ? 'text-rose-400' : 'text-green-400'}`}>
                  {analysis.silenceDetected ? 'YES' : 'NO'}
                </span>
              </div>
               <div className="flex justify-between items-center p-2 rounded hover:bg-slate-700/30 transition-colors">
                <span className="text-slate-400 text-sm">Silence Type</span>
                <span className="font-mono text-white capitalize">{analysis.silenceType}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded hover:bg-slate-700/30 transition-colors">
                <span className="text-slate-400 text-sm">Silence Events</span>
                <span className="font-mono text-white">{analysis.silenceCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col h-full">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-indigo-400" /> AI Summary & Transcription
          </h3>
          
          <div className="flex-1 space-y-4">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
              <span className="text-xs font-bold text-indigo-400 uppercase mb-2 block">Synthèse (AI)</span>
              <p className="text-sm text-slate-300 leading-relaxed">
                {analysis.summary}
              </p>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 flex-1">
              <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">Transcription (Preview)</span>
              <p className="text-xs text-slate-400 font-mono leading-relaxed h-48 overflow-y-auto scrollbar-hide">
                {analysis.transcription}
              </p>
            </div>
            
            {analysis.anomalies.length > 0 && (
              <div className="bg-rose-500/10 rounded-lg p-4 border border-rose-500/20">
                <span className="text-xs font-bold text-rose-400 uppercase mb-2 block">Detected Anomalies</span>
                <ul className="text-xs text-rose-300 list-disc list-inside">
                  {analysis.anomalies.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResultsPanel;