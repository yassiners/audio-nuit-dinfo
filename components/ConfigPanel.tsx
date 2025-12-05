import React from 'react';
import { Settings, FileType, Hash, Bell, Folder, Clock, CalendarClock, Scissors } from 'lucide-react';
import { AudioFormat, AudioBitrate, ProcessingConfig, RetentionPeriod } from '../types';

interface ConfigPanelProps {
  config: ProcessingConfig;
  setConfig: React.Dispatch<React.SetStateAction<ProcessingConfig>>;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, setConfig }) => {
  const handleChange = (key: keyof ProcessingConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8">
      
      {/* SECTION 1: Format & Quality */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Audio Quality</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
              <FileType className="w-4 h-4 text-indigo-400" />
              <span>Output Format</span>
            </label>
            <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
              {Object.values(AudioFormat).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => handleChange('format', fmt)}
                  className={`
                    flex-1 py-1.5 rounded-md text-xs font-medium transition-all
                    ${config.format === fmt 
                      ? 'bg-indigo-600 text-white shadow' 
                      : 'text-slate-400 hover:text-slate-200'}
                  `}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
              <Settings className="w-4 h-4 text-indigo-400" />
              <span>Bitrate</span>
            </label>
            <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
              {Object.values(AudioBitrate).map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleChange('bitrate', rate)}
                  className={`
                    flex-1 py-1.5 rounded-md text-xs font-medium transition-all
                    ${config.bitrate === rate 
                      ? 'bg-slate-600 text-white shadow' 
                      : 'text-slate-400 hover:text-slate-200'}
                  `}
                >
                  {rate}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Duration & Retention */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time Management</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Duration Editing */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
              <Scissors className="w-4 h-4 text-indigo-400" />
              <span>Max Duration (Minutes)</span>
            </label>
            <input 
              type="number" 
              min="0"
              value={config.maxDurationMinutes}
              onChange={(e) => handleChange('maxDurationMinutes', parseInt(e.target.value) || 0)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
              placeholder="0 (Unlimited)"
            />
            <div className="flex items-center mt-2">
               <input 
                id="smartExtend"
                type="checkbox"
                checked={config.smartExtend}
                onChange={(e) => handleChange('smartExtend', e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-700"
               />
               <label htmlFor="smartExtend" className="ml-2 text-xs text-slate-400 select-none">
                 AI Smart Extend (Don't cut discussions)
               </label>
            </div>
          </div>

          {/* Retention */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
              <CalendarClock className="w-4 h-4 text-indigo-400" />
              <span>File Retention Policy</span>
            </label>
            <select
              value={config.retentionPeriod}
              onChange={(e) => handleChange('retentionPeriod', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
            >
              {Object.values(RetentionPeriod).map((period) => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: Storage & Naming */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Storage & Alerts</h4>
        
        {/* Storage Path */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
            <Folder className="w-4 h-4 text-indigo-400" />
            <span>Server Storage Path</span>
          </label>
          <input 
            type="text" 
            value={config.storagePath}
            onChange={(e) => handleChange('storagePath', e.target.value)}
            placeholder="/mnt/broadcast/archives/"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Dynamic Naming */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
            <Hash className="w-4 h-4 text-indigo-400" />
            <span>Naming Pattern</span>
          </label>
          <input 
            type="text" 
            value={config.namingPattern}
            onChange={(e) => handleChange('namingPattern', e.target.value)}
            placeholder="%textNonObligatoire%_%jour%-%mois%"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
          />
          <p className="text-[10px] text-slate-500 px-1">
            Ex: %textNonObligatoire%_%jour%-%mois%_%heure%h%minutes%
          </p>
        </div>

        {/* Alerting */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
            <Bell className="w-4 h-4 text-rose-400" />
            <span>Technical Silence Alert Email</span>
          </label>
          <input 
            type="email" 
            value={config.alertEmail}
            onChange={(e) => handleChange('alertEmail', e.target.value)}
            placeholder="tech@station.fm"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;