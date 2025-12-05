import React, { useRef, useState } from 'react';
import { Upload, Music, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type.startsWith('audio/') || file.type === 'video/ogg') {
      onFileSelect(file);
    } else {
      alert('Please upload a valid audio file.');
    }
  };

  return (
    <div 
      className={`
        relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer group
        ${isDragging 
          ? 'border-indigo-400 bg-slate-800/80 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
          : 'border-slate-600 hover:border-indigo-500 hover:bg-slate-800/50 bg-slate-800/30'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileInput} 
        accept="audio/*" 
        className="hidden" 
      />
      
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        {selectedFile ? (
          <>
            <div className="p-4 rounded-full bg-indigo-500/20 text-indigo-400">
              <Music className="w-10 h-10" />
            </div>
            <div>
              <p className="text-lg font-medium text-white">{selectedFile.name}</p>
              <p className="text-sm text-slate-400 mt-1">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <p className="text-xs text-indigo-300 font-medium">Click to change file</p>
          </>
        ) : (
          <>
            <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700/50 text-slate-400 group-hover:text-indigo-400'}`}>
              <Upload className="w-10 h-10" />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-200">
                Drop audio file here
              </p>
              <p className="text-sm text-slate-400 mt-1">
                or click to browse
              </p>
            </div>
            <div className="flex gap-2 justify-center text-xs text-slate-500 mt-2">
              <span className="bg-slate-800 px-2 py-1 rounded">MP3</span>
              <span className="bg-slate-800 px-2 py-1 rounded">WAV</span>
              <span className="bg-slate-800 px-2 py-1 rounded">FLAC</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;