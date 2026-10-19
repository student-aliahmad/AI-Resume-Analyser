import { create } from "zustand";
import { GoogleGenAI } from "@google/genai"

interface GeminiStore {
    isLoading : boolean;
    error: string | null;
    analyzeResume: (resumeText: string, jobDescription?: string) => Promise<any>;
    clearError: () => void;
}

const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
});

export const useGeminiStore = create<GeminiStore>((set) => ({
    isLoading : false,
    error : null,

    clearError: () => set({ error: null}),

    analyzeResume: async (resumeText: string, jobDescription?: string) => {
       set({ isLoading: true, error: null });
    
       console.log("Resume text length:", resumeText.length);
       
       try {
        console.log("2. Calling Gemini...");
        const prompt = `
        You are an expert ATS (Application Tracking System) Scanner and Senior HR Recuiter.
        Analyze the provided Resume content against the Job Description (if provided).

        RESUME TEXT:
        ${resumeText}

        ${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}` : ""}

Return the result as a JSON object using EXACTLY this structure:

{
  "overallScore": 0,
  "ATS": {
    "score": 0,
    "tips": [
      {
        "type": "good",
        "tip": "Example tip"
      }
    ]
  },
  "toneAndStyle": {
    "score": 0,
    "tips": [
      {
        "type": "good",
        "tip": "Example tip",
        "explanation": "Detailed explanation"
      }
    ]
  },
  "content": {
    "score": 0,
    "tips": [
      {
        "type": "good",
        "tip": "Example tip",
        "explanation": "Detailed explanation"
      }
    ]
  },
  "structure": {
    "score": 0,
    "tips": [
      {
        "type": "good",
        "tip": "Example tip",
        "explanation": "Detailed explanation"
      }
    ]
  },
  "skills": {
    "score": 0,
    "tips": [
      {
        "type": "good",
        "tip": "Example tip",
        "explanation": "Detailed explanation"
      }
    ]
  }
}

Rules:
- All scores must be numbers from 0 to 100.
- Each tips array should contain 3-4 useful tips.
- "type" must be either "good" or "improve".
- Return ONLY valid JSON.
- Do not return markdown.
- Do not return backticks.
- Do not add any text outside the JSON.
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });

         set({ isLoading: false });

         if(response.text) {
            return JSON.parse(response.text);
         } else{
            throw new Error("No response text received from Gemini.");
         }
       } catch (err) {
        
          const errorMsg = 
          err instanceof Error ? err.message : "Failed to analyze resume";
          set({ error: errorMsg, isLoading: false });
          console.error("Gemini Store Error:", err);
          return null; 
       }
    },
}));