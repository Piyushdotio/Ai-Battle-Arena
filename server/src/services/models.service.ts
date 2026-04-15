import { ChatGoogle } from "@langchain/google";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatCohere } from "@langchain/cohere";
import configs from "../config/config.js";

// Validate API keys on startup
if (!configs.GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY is missing in .env file");
}
if (!configs.MISTRAL_API_KEY) {
  console.warn("⚠️ MISTRAL_API_KEY is missing in .env file");
}
if (!configs.COHERE_API_KEY) {
  console.warn("⚠️ COHERE_API_KEY is missing in .env file");
}

export const geminiModel = new ChatGoogle({
  model: "gemini-flash-latest",
  openAIApiKey: configs.GEMINI_API_KEY,
});
export const MistralModel = new ChatMistralAI({
  model: "mistral-medium-latest",
  apiKey: configs.MISTRAL_API_KEY,
});

export const CohereModel = new ChatCohere({
  model: "command-a-03-2025",
  apiKey: configs.COHERE_API_KEY,
});

console.log("✓ Models initialized:");
console.log("  - GEMINI AI");
console.log("  - Mistral AI");
console.log("  - Cohere");
