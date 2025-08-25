import { NextRequest } from 'next/server';
import Groq from 'groq-sdk';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { description, imageUrl } = await req.json();

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const completion = await groq.chat.completions.create({
    model: 'llava-v1.5-7b-4096',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: description },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
    max_tokens: 2048,
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || '';
        controller.enqueue(new TextEncoder().encode(content));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}