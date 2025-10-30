import { createOpenAI } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText, type ToolSet } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  console.log("messages---------", messages);
  const processedMessages = messages.map((message: any) => {
    // 如果消息包含附件
    if (message.experimental_attachments && message.experimental_attachments.length > 0) {
      const attachmentText = message.experimental_attachments
        .map((att: any) => {
          if (att.contentType.startsWith('image/')) {
            return `[图片: ${att.name}](${att.url})`;
          } else if (att.contentType === 'application/pdf') {
            return `[PDF: ${att.name}](${att.url})`;
          } else {
            return `[文件: ${att.name}](${att.url})`;
          }
        })
        .join('\n');

      return {
        role: message.role,
        content: `${message.content}\n\n附件:\n${attachmentText}`,
      };
    }
    
    return {
      role: message.role,
      content: message.content,
    };
  });
  const openai = createOpenAI({
    apiKey: "sk-18c1c0a82f1b44b4936e7e0b0da2ae08",
    baseURL: "https://api.deepseek.com",
  });
  // const openai = createOpenAI({
  //   apiKey: 'sk-18c1c0a82f1b44b4936e7e0b0da2ae08',
  //   baseURL: "https://api.deepseek.com",
  // });

  const result = streamText({
    // model: openai('gpt-4o'),
    model: openai("deepseek-chat"),
    maxSteps: 10,
    messages:convertToCoreMessages(processedMessages),
    tools: {} as ToolSet,
  });

  return result.toDataStreamResponse({
    sendReasoning: true,
    sendSources: true,
  });
}
