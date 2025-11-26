import { GoogleGenAI } from "@google/genai";
import { Prize, Theme } from "../types";

// Initialize Gemini AI
// Note: In a real production app, consider proxying this request to hide the key.
// However, for this frontend-only demo, we assume the key is injected via process.env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCongratulation = async (prize: Prize, theme: Theme): Promise<string> => {
  try {
    const themeName = theme === Theme.CHRISTMAS ? "Christmas" : "Chinese New Year";
    const prompt = `
      You are a cheerful mascot for an elementary school lottery.
      A student just won a "${prize.name}" (${prize.nameCN}).
      The current theme is ${themeName}.
      Write a very short (max 15 words), bilingual (English and Chinese), exciting congratulatory message.
      Example format: "Wow! Great job! 哇！太棒了！"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Congratulations! 恭喜你！";
  } catch (error) {
    console.error("Error generating message:", error);
    return "Congratulations! 恭喜你！";
  }
};