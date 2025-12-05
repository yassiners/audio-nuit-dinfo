import { GoogleGenAI, Type } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const analyzeAudioWithGemini = async (file: File): Promise<{ transcription: string; summary: string; anomalies: string[]; silenceType: 'natural' | 'technical' | 'none' }> => {
  
  // Convert File to Base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:audio/mp3;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const model = "gemini-2.5-flash"; // Efficient for audio

  try {
    // Initialize client inside try block to safely handle missing API keys
    const ai = getGeminiClient();
    
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type || "audio/mp3", // Fallback if type empty
              data: base64Data,
            },
          },
          {
            text: `
              Agissez comme un ingénieur du son expert et un secrétaire de séance.
              Veuillez effectuer les tâches suivantes sur ce fichier audio :
              
              1. **Synthèse**: Fournissez d'abord une synthèse écrite détaillée (compte-rendu de réunion ou résumé d'émission) en Français.
              2. **Analyse des Blancs**: Si vous détectez des silences, analysez s'ils sont "naturels" (pauses de réflexion, effet dramatique) ou "techniques" (perte de signal, silence > 5s sans contexte).
              3. **Anomalies**: Identifiez toute anomalie audio subjective (bruit de fond, distorsion).
              4. **Transcription**: Fournissez une transcription verbatim à la fin.
              
              Répondez uniquement au format JSON.
            `
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            silenceType: { type: Type.STRING, enum: ['natural', 'technical', 'none'] },
            anomalies: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            transcription: { type: Type.STRING },
          },
          // CRITICAL: Order properties so summary comes before transcription.
          // If transcription is cut off due to token limits, we still get the summary.
          propertyOrdering: ["summary", "silenceType", "anomalies", "transcription"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.warn("JSON Parse failed (likely truncated), attempting recovery...", parseError);
      
      // Recovery Strategy:
      // If the JSON is truncated in the "transcription" field (which is last),
      // we can try to salvage the previous fields.
      
      // 1. Try to find the start of the transcription field and cut it off
      const transcriptionIndex = text.lastIndexOf('"transcription"');
      if (transcriptionIndex !== -1) {
        // Find the comma before transcription and cut there
        const lastComma = text.lastIndexOf(',', transcriptionIndex);
        if (lastComma !== -1) {
          const salvagedJson = text.substring(0, lastComma) + "}";
          try {
            const data = JSON.parse(salvagedJson);
            // Return salvaged data with a placeholder for the truncated transcription
            return {
              ...data,
              transcription: "Transcription tronquée (Fichier trop volumineux pour l'affichage complet)."
            };
          } catch (e) {
            console.error("Recovery failed", e);
          }
        }
      }

      // 2. Fallback: manual extraction if structure is badly broken
      // Note: This is a rough fallback
      return {
        transcription: "Erreur de formatage (Réponse tronquée)",
        summary: text.match(/"summary"\s*:\s*"([^"]*)"/)?.[1] || "Résumé indisponible",
        anomalies: ["Erreur de parsing JSON"],
        silenceType: 'none'
      };
    }

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      transcription: "Erreur lors de l'analyse AI. (Vérifiez la clé API ou le format du fichier)",
      summary: "Impossible de générer le résumé.",
      anomalies: ["Échec de l'analyse AI"],
      silenceType: 'none'
    };
  }
};