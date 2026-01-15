
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Initialize GoogleGenAI with the API key from environment variables.
    // Must use the named parameter `apiKey`.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateRemark(studentName: string, performance: string, role: 'Form Master' | 'Principal'): Promise<string> {
    try {
      // Use ai.models.generateContent to query GenAI with the model name and prompt.
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a professional and encouraging school report card remark for a student named ${studentName}. 
                  Performance summary: ${performance}.
                  The remark should be from the perspective of a ${role}. 
                  Keep it concise (1-2 sentences) and suitable for a Nigerian school context.`,
      });
      // The text property returns the generated content as a string.
      return response.text?.trim() || "Performance is satisfactory.";
    } catch (error) {
      console.error("AI Remark Error:", error);
      return "Maintains a good steady pace in academic performance.";
    }
  }
}

export const geminiService = new GeminiService();
