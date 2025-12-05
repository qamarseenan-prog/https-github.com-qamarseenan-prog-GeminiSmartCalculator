import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// Ideally, in a real app, we would handle missing keys more gracefully in the UI,
// but strictly adhering to instructions, we assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const solveMathWithGemini = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API Key is missing for Gemini Service.");
    return "Error: API Key Missing";
  }

  try {
    const model = 'gemini-2.5-flash';
    
    // System instruction to ensure the model behaves strictly as a calculator
    const systemInstruction = `You are a precise mathematical assistant. 
    1. Solve the user's math problem.
    2. Return ONLY the numerical result or a very brief error message (e.g., "Invalid input").
    3. Do not add markdown, explanations, or chatter unless explicitly asked for an explanation.
    4. If the input is simple arithmetic (e.g., "5 + 5"), just return "10".
    5. If the input is a complex word problem, solve it and return just the final number.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1, // Low temperature for deterministic math results
      }
    });

    return response.text?.trim() || "Error";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error";
  }
};
