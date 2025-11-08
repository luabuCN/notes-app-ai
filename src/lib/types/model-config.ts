export type ModelProvider = "gemini" | "deepseek" | "openrouter" | "openai";

export interface ModelConfig {
  id?: string;
  provider: ModelProvider;
  apiKey: string;
  modelName: string;
  baseURL?: string;
}

