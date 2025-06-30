import Constants from "@/data/Constants";
import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({

    apiKey: "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",
    
    });

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { model, description, imageUrl } = await req.json();
  const ModelObj = Constants.AiModelList.find(item => item.name === model);
  const modelName = ModelObj?.modelName ?? "gpt-4o";
  const isVisionModel = modelName.includes("vision") || modelName === "gpt-4o";

  const content: Array<{
    type: "text" | "image_url";
    text?: string;
    image_url?: { url: string };
  }> = [
    { type: "text", text: description },
    ...(isVisionModel && imageUrl 
      ? [{ type: "image_url" as const, image_url: { url: imageUrl } }] 
      : [])
  ];

  const response = await openai.chat.completions.create({
    model: modelName,
    stream: true,
    messages: [
        {
            role: "user",
            content: [  // Changed from 'ccontent' to 'content'
              {
                type: "text",
                text: description
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
    ],
  });

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const text = chunk.choices?.[0]?.delta?.content || "";
        controller.enqueue(new TextEncoder().encode(text));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}