import { z } from "zod";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const excalidrawSchema = z.object({
  elements: z.array(z.any()),
  appState: z.object({}).passthrough(),
  files: z.record(z.any()),
});

const openai = createOpenAI({
  apiKey: 'sk-fXv4Z8sUAlRDbFtkDzyAu3w8vl8mYlUJlGpXsigle4C0y4Og',
  baseURL: "https://api.chatanywhere.tech",
});

export async function generateDrawing(prompt: string) {
  try {
    const result = await generateObject({
      model: openai("deepseek-chat"),
      prompt: `
你是一个流程图助手，请将以下描述转换为 Excalidraw 所需的 JSON：
${prompt}
请确保输出为合法 JSON，仅包含 elements、appState、files 字段。
`,
      schema: excalidrawSchema,
    });

    return result.object;
  } catch (e) {
    console.error("生成失败:", e);
    throw new Error("AI 返回数据解析失败");
  }
}
