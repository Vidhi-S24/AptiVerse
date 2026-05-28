import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing from your environment variables.");
}

export const geminiClient = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
});