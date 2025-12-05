export enum AudioFormat {
  MP3 = 'MP3',
  WAV = 'WAV',
  FLAC = 'FLAC'
}

export enum AudioBitrate {
  LOW = '128k',
  MEDIUM = '192k',
  HIGH = '320k'
}

export enum RetentionPeriod {
  WEEK = '7 Jours',
  MONTH = '1 Mois',
  QUARTER = '3 Mois',
  YEAR = '1 An',
  FOREVER = 'Indéterminé'
}

export interface ProcessingConfig {
  format: AudioFormat;
  bitrate: AudioBitrate;
  namingPattern: string;
  alertEmail: string;
  storagePath: string;
  retentionPeriod: RetentionPeriod;
  maxDurationMinutes: number; // 0 for unlimited
  smartExtend: boolean; // Prevent cutting during active speech
}

export interface AnalysisResult {
  duration: number;
  silenceDetected: boolean;
  silenceType: 'natural' | 'technical' | 'none';
  silenceCount: number;
  transcription: string;
  summary: string;
  anomalies: string[];
}

export interface ProcessedFile {
  originalName: string;
  finalName: string;
  url: string;
  size: number;
  storagePath: string;
}