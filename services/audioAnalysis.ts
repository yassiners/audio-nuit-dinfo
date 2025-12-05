export const analyzeAudioBuffer = async (file: File): Promise<{
  duration: number;
  silenceDetected: boolean;
  silenceCount: number;
  maxAmplitude: number;
}> => {
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  try {
    // Decode the audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    if (audioBuffer.numberOfChannels === 0) {
      throw new Error("No audio channels detected");
    }

    const rawData = audioBuffer.getChannelData(0); // Analyze first channel
    const sampleRate = audioBuffer.sampleRate;
    const bufferLength = rawData.length;
    
    // Parameters for silence detection
    const silenceThreshold = 0.01; // Amplitude threshold (approx -40dB)
    const minSilenceDuration = 2.0; // Seconds to consider "unnatural silence"
    
    let silenceStart = -1;
    let silenceCount = 0;
    let maxAmplitude = 0;
    let isSilenceDetected = false;

    const minSilenceSamples = minSilenceDuration * sampleRate;

    for (let i = 0; i < bufferLength; i++) {
      const amplitude = Math.abs(rawData[i]);
      if (amplitude > maxAmplitude) maxAmplitude = amplitude;

      if (amplitude < silenceThreshold) {
        if (silenceStart === -1) {
          silenceStart = i;
        }
      } else {
        if (silenceStart !== -1) {
          const silenceLength = i - silenceStart;
          if (silenceLength > minSilenceSamples) {
            silenceCount++;
            isSilenceDetected = true;
          }
          silenceStart = -1;
        }
      }
    }

    // Check tail silence
    if (silenceStart !== -1) {
      const silenceLength = bufferLength - silenceStart;
      if (silenceLength > minSilenceSamples) {
        silenceCount++;
        isSilenceDetected = true;
      }
    }

    return {
      duration: audioBuffer.duration,
      silenceDetected: isSilenceDetected,
      silenceCount,
      maxAmplitude
    };
  } finally {
    // Crucial: Close the context to prevent memory leaks and browser limits (usually max 6 contexts)
    await audioContext.close();
  }
};

export const generateNewFilename = (originalName: string, pattern: string, extension: string): string => {
  const now = new Date();
  
  // Handle filenames with multiple dots (e.g., "archive.v1.mp3") correctly
  const dotIndex = originalName.lastIndexOf('.');
  const nameWithoutExt = dotIndex === -1 ? originalName : originalName.substring(0, dotIndex);
  const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');

  const map: Record<string, string> = {
    // English defaults
    '%text%': safeName,
    '%day%': String(now.getDate()).padStart(2, '0'),
    '%month%': String(now.getMonth() + 1).padStart(2, '0'),
    '%year%': String(now.getFullYear()),
    '%hour%': String(now.getHours()).padStart(2, '0'),
    '%minute%': String(now.getMinutes()).padStart(2, '0'),

    // French requests
    '%textNonObligatoire%': safeName,
    '%jour%': String(now.getDate()).padStart(2, '0'),
    '%mois%': String(now.getMonth() + 1).padStart(2, '0'),
    '%annee%': String(now.getFullYear()),
    '%heure%': String(now.getHours()).padStart(2, '0'),
    '%minutes%': String(now.getMinutes()).padStart(2, '0')
  };

  let newName = pattern;
  Object.keys(map).forEach(key => {
    // Replace all occurrences
    newName = newName.split(key).join(map[key]);
  });

  // Ensure no double extension
  return `${newName}.${extension.toLowerCase()}`;
};