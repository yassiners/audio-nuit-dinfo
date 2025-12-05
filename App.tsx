import React, { useState, useEffect } from 'react';
import { Radio, ChevronRight, Zap } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ConfigPanel from './components/ConfigPanel';
import ProcessingOverlay from './components/ProcessingOverlay';
import ResultsPanel from './components/ResultsPanel';
import { AudioFormat, AudioBitrate, ProcessingConfig, AnalysisResult, ProcessedFile, RetentionPeriod } from './types';
import { analyzeAudioBuffer, generateNewFilename } from './services/audioAnalysis';
import { analyzeAudioWithGemini } from './services/gemini';

const App: React.FC = () => {
  // Application State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('Initializing...');
  const [results, setResults] = useState<{ analysis: AnalysisResult; fileData: ProcessedFile } | null>(null);

  // Config State
  const [config, setConfig] = useState<ProcessingConfig>({
    format: AudioFormat.MP3,
    bitrate: AudioBitrate.MEDIUM,
    namingPattern: '%textNonObligatoire%_%jour%-%mois%_%heure%h%minutes%',
    alertEmail: '',
    storagePath: '/var/www/broadcasts/',
    retentionPeriod: RetentionPeriod.MONTH,
    maxDurationMinutes: 0,
    smartExtend: true
  });

  const handleReset = () => {
    // Revoke the old object URL to avoid memory leaks
    if (results?.fileData.url) {
      URL.revokeObjectURL(results.fileData.url);
    }
    setSelectedFile(null);
    setResults(null);
    setIsProcessing(false);
  };

  const processAudio = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      
      // Stage 1: Ingest & Client-side Analysis
      setProcessingStage('Analyzing Signal Topology...');
      const signalData = await analyzeAudioBuffer(selectedFile);
      
      // Stage 2: AI Processing (Gemini)
      setProcessingStage('Running Neural Analysis (Gemini 2.5)...');
      const aiData = await analyzeAudioWithGemini(selectedFile);

      // Stage 3: Conversion Simulation & Renaming
      setProcessingStage('Transcoding, Editing & Renaming...');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate ffmpeg delay

      const newFilename = generateNewFilename(selectedFile.name, config.namingPattern, config.format);
      
      // Create a blob URL for download (In a real app, this would be the converted file)
      const url = URL.createObjectURL(selectedFile);

      setResults({
        analysis: {
          ...signalData,
          ...aiData,
          // If Gemini says technical, overwrite the DSP flag logic if needed, 
          // or combine them. Here we prioritize AI classification for the type.
          silenceType: aiData.silenceType 
        },
        fileData: {
          originalName: selectedFile.name,
          finalName: newFilename,
          url: url,
          size: selectedFile.size,
          storagePath: config.storagePath
        }
      });

    } catch (error) {
      console.error(error);
      alert('An error occurred during processing. Please check the console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 selection:bg-indigo-500/30">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-2 rounded-lg">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              National Audio Challenge <span className="text-slate-500 font-normal mx-2">|</span> AI Processing Module
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>System Online</span>
            </div>
            <div className="h-4 w-px bg-slate-800"></div>
            <span>v2.6.1-patch</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Intro Text (only show if no results) */}
        {!results && (
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-3">Intelligent Audio Processing</h2>
            <p className="text-slate-400">
              Upload your raw broadcast audio. Our local AI pipeline will transcribe, synthesize, 
              detect technical silence vs natural pauses, and format the file for distribution automatically.
            </p>
          </div>
        )}

        <div className="relative bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden min-h-[500px]">
          
          {isProcessing && <ProcessingOverlay status={processingStage} />}

          <div className="p-8">
            {!results ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Upload & Config */}
                <div className="lg:col-span-7 space-y-8">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">1. Source Audio</h3>
                    <FileUpload 
                      onFileSelect={setSelectedFile} 
                      selectedFile={selectedFile} 
                    />
                  </div>
                  
                  <div>
                     <h3 className="text-lg font-medium text-white mb-4">2. Processing Rules</h3>
                     <ConfigPanel config={config} setConfig={setConfig} />
                  </div>
                </div>

                {/* Right: Summary & Action */}
                <div className="lg:col-span-5 flex flex-col justify-between border-l border-slate-700/50 pl-10">
                   <div className="space-y-6">
                      <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Pipeline Preview</h4>
                        <ul className="space-y-3">
                          <li className="flex items-center text-sm text-slate-300">
                            <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mr-3 text-xs font-bold">1</span>
                            Ingest to <span className="font-mono text-xs text-indigo-300 ml-1">{config.storagePath}</span>
                          </li>
                          <li className="flex items-center text-sm text-slate-300">
                            <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mr-3 text-xs font-bold">2</span>
                            AI Silence Analysis (Natural vs Technical)
                          </li>
                          <li className="flex items-center text-sm text-slate-300">
                            <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mr-3 text-xs font-bold">3</span>
                            Transcode: {config.format}/{config.bitrate} 
                            {config.maxDurationMinutes > 0 && <span className="ml-1 text-xs text-orange-400">({config.maxDurationMinutes}m Limit)</span>}
                          </li>
                          <li className="flex items-center text-sm text-slate-300">
                            <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mr-3 text-xs font-bold">4</span>
                            Generate Synthesis & Retention ({config.retentionPeriod})
                          </li>
                        </ul>
                      </div>
                      
                      {config.alertEmail && (
                        <div className="bg-rose-500/10 p-4 rounded-lg border border-rose-500/20">
                          <p className="text-xs text-rose-300">
                            <strong>Alert Active:</strong> Auto-email to <span className="underline">{config.alertEmail}</span> if <u>Technical Silence</u> is detected.
                          </p>
                        </div>
                      )}
                   </div>

                   <button
                    onClick={processAudio}
                    disabled={!selectedFile || isProcessing}
                    className={`
                      w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center transition-all transform
                      ${!selectedFile 
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-500/25 hover:scale-[1.02]'}
                    `}
                   >
                     <Zap className="w-5 h-5 mr-2" />
                     Launch AI Processing
                   </button>
                </div>
              </div>
            ) : (
              <ResultsPanel 
                analysis={results.analysis} 
                fileData={results.fileData} 
                config={config}
                onReset={handleReset}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;