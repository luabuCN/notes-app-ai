export type ModelProvider = "gemini" | "deepseek" | "openrouter";

export interface ModelConfig {
  id?: string;
  provider: ModelProvider;
  apiKey: string;
  modelName: string;
  baseURL?: string;
}

