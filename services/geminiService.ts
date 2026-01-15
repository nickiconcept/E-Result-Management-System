import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateRemark(studentName: string, performance: string, role: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a professional school report card remark for a student named ${studentName}. 
                  Performance summary: ${performance}.
                  Perspective: ${role}. 
                  Keep it concise (1-2 sentences) and professional for a Nigerian school context.`,
      });
      return response.text || "Performance is satisfactory.";
    } catch (error) {
      console.error("AI Remark Error:", error);
      return "Demonstrates a good understanding of the subject matter.";
    }
  }
}

export const geminiService = new GeminiService();