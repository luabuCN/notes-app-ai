import {  streamText, type ToolSet ,convertToModelMessages, stepCountIs, type UIMessage, type TextStreamPart} from "ai";
import type { NextRequest } from "next/server";

import { resolveUserConfiguredModel } from "@/lib/ai/user-model";

export const maxDuration = 30;

/**
 * 固定字符数分块的流式输出转换
 * @param chunkSize 每个chunk的字符数，默认10
 * @param delayInMs 块之间的延迟毫秒数，默认10
 */
function createSmoothStream(chunkSize: number = 1, delayInMs: number = 10) {
  return () => {
    let buffer = '';
    let lastId = 'stream';

    return new TransformStream<TextStreamPart<ToolSet>, TextStreamPart<ToolSet>>({
      async transform(chunk, controller) {
        if (chunk.type !== 'text-delta') {
          if (buffer.length > 0) {
            controller.enqueue({ text: buffer, type: 'text-delta', id: lastId });
            buffer = '';
          }
          controller.enqueue(chunk);
          return;
        }

        lastId = chunk.id ?? lastId;
        buffer += chunk.text;

        while (buffer.length >= chunkSize) {
          const chunkText = buffer.slice(0, chunkSize);
          controller.enqueue({ text: chunkText, type: 'text-delta', id: lastId });
          buffer = buffer.slice(chunkSize);
          if (delayInMs != null && delayInMs > 0) {
            await new Promise((r) => setTimeout(r, delayInMs));
          }
        }
      },
      flush(controller) {
        if (buffer.length > 0) {
          controller.enqueue({ text: buffer, type: 'text-delta', id: lastId });
          buffer = '';
        }
      },
    });
  };
}

export async function POST(req: NextRequest) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  console.log(messages,'messages------');
  
  const { model, errorResponse } = await resolveUserConfiguredModel(req);

  if (!model || errorResponse) {
    return errorResponse;
  }

  const result = streamText({
    model,
    messages:convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {} as ToolSet,
    experimental_transform: createSmoothStream(10, 10),
  });
  return result.toUIMessageStreamResponse();
}
