import { GoogleGenAI, Type } from "@google/genai";

const apiKey =
  (import.meta.env && (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)) ||
  process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("VITE_GEMINI_API_KEY is not defined. AI features will be unavailable.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function analyzeMedia(file: File, mimeType: string) {
  if (!apiKey || apiKey === "undefined") {
    throw new Error("AI analysis is unavailable: Missing VITE_GEMINI_API_KEY. \nPlease add VITE_GEMINI_API_KEY to your Netlify site environment variables.");
  }

  try {
    const base64Data = await fileToBase64(file);
    
    const systemInstruction = `
      You are an expert Digital Forensic Analyst for the "FakeXpose" system.
      Your task is to analyze media (images, video, or audio) for indicators of artificial manipulation, deepfakes, or voice cloning.
      
      Detection Scope:
      1. Visual Deepfakes: Face-swapping, lip-sync mismatch, unnatural blinking, blending artifacts on facial contours.
      2. Video Cloning: Synthetic motion patterns, frequency mismatch in frames.
      3. Audio Voice Cloning: Robotic cadence, spectral anomalies, lack of natural breath patterns, synthetic timbre.
      
      Artifact Mapping (CRITICAL):
      If you detect visual manipulation (Deepfakes/Blending), you MUST provide spatial coordinates for the "artifacts" array.
      - Use normalized coordinates (0-100) where (0,0) is top-left.
      - Each artifact needs a type (blending, blinking, mesh, or skin) and a clear label describing the anomaly.
      
      Result Requirements:
      - Be extremely clear and use simple English in the 'simpleExplanation' field so a non-technical user understands exactly why the media is flagged or safe.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            { 
              text: `Perform a deep forensic scan and GLOBAL WEB PROBE. 
              1. Analyze if this is a deepfake or clone (spectrogram/artifacts/mesh).
              2. Search the global internet to find where this exact or related images/media exist. 
              3. Identify if the media is being used in unauthorized or suspicious contexts (illegal usage).
              4. Provide a summary of the web presence including a estimated count of related matches and key source URLs.` 
            },
          ],
        },
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.NUMBER,
              description: "Security Score (0-100). Higher is more authentic.",
            },
            verdict: {
              type: Type.STRING,
              enum: ["SECURE", "SUSPICIOUS", "MANIPULATED"],
            },
            confidence: {
              type: Type.NUMBER,
            },
            findings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            simpleExplanation: {
              type: Type.STRING,
              description: "A clear, simple explanation for the user in plain English.",
            },
            riskLevel: {
              type: Type.STRING,
              enum: ["Low", "Medium", "High", "Critical"],
            },
            artifacts: {
              type: Type.ARRAY,
              description: "Spatial coordinates of detected manipulation artifacts.",
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING, description: "Anomaly description" },
                  x: { type: Type.NUMBER, description: "X coordinate (0-100)" },
                  y: { type: Type.NUMBER, description: "Y coordinate (0-100)" },
                  width: { type: Type.NUMBER, description: "Width (0-100)" },
                  height: { type: Type.NUMBER, description: "Height (0-100)" },
                  type: { type: Type.STRING, enum: ["blending", "blinking", "mesh", "skin", "other"] }
                },
                required: ["label", "x", "y", "width", "height", "type"]
              }
            },
            webScan: {
              type: Type.OBJECT,
              properties: {
                matchCount: { type: Type.NUMBER, description: "Estimated number of related images/media found on the web." },
                isIllegallyUsed: { type: Type.BOOLEAN, description: "Whether the media appears to be used in unauthorized or illegal contexts." },
                summary: { type: Type.STRING, description: "A summary of the global web probe findings." },
                sources: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      url: { type: Type.STRING }
                    },
                    required: ["title", "url"]
                  }
                }
              },
              required: ["matchCount", "isIllegallyUsed", "summary", "sources"]
            }
          },
          required: ["score", "verdict", "confidence", "findings", "riskLevel", "simpleExplanation", "webScan", "artifacts"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from analysis engine.");
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Forensic Analysis Failure:", error);
    throw error;
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result?.toString().split(',')[1];
      if (base64String) resolve(base64String);
      else reject(new Error("Failed to convert file to base64"));
    };
    reader.onerror = error => reject(error);
  });
}
