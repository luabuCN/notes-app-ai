export type ModelProvider = "gemini" | "deepseek" | "openrouter" | "openai";

export interface ModelConfig {
  id?: string;
  provider: ModelProvider;
  apiKey: string;
  modelName: string;
  baseURL?: string;
  isActive?: boolean;
  // 请求体辅助字段：保存时是否激活当前配置
  activate?: boolean;
}

