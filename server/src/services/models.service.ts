import { ChatOpenAI } from "@langchain/openai";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatCohere } from "@langchain/cohere";
import configs from "../config/config.js";

// Validate API keys on startup
if (!configs.OPENAI_API_KEY) {
  console.warn("⚠️ OPENAI_API_KEY is missing in .env file");
}
if (!configs.MISTRAL_API_KEY) {
  console.warn("⚠️ MISTRAL_API_KEY is missing in .env file");
}
if (!configs.COHERE_API_KEY) {
  console.warn("⚠️ COHERE_API_KEY is missing in .env file");
}

export const OPENAIModel = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  openAIApiKey: configs.OPENAI_API_KEY,
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
console.log("  - OpenAI GPT");
console.log("  - Mistral AI");
console.log("  - Cohere");
