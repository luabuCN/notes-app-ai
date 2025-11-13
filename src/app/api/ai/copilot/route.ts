import type { NextRequest } from 'next/server';

import { generateText } from 'ai';
import { NextResponse } from 'next/server';

import { resolveUserConfiguredModel } from '@/lib/ai/user-model';

export async function POST(req: NextRequest) {
  const {
    prompt,
    system,
  } = await req.json();

  const { model, errorResponse } = await resolveUserConfiguredModel(req);

  if (!model || errorResponse) {
    return errorResponse;
  }

  try {
    const result = await generateText({
      abortSignal: req.signal,
      maxOutputTokens: 50,
      model,
      prompt: prompt,
      system,
      temperature: 0.7,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(null, { status: 408 });
    }

    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
