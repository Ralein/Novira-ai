import Constants from "@/data/Constants";
import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Loaded' : 'Not Loaded');
  const { model, description, imageUrl } = await req.json();
  console.log('Request Body:', { model, description, imageUrl });

  const ModelObj = Constants.AiModelList.find(item => item.name === model);
  const modelName = ModelObj?.modelName ?? "gemini-pro-vision"; // Default to vision model

  const geminiModel = genAI.getGenerativeModel({ model: modelName });

  const parts = [
    { text: description },
    { inlineData: { mimeType: "image/png", data: imageUrl.split(",")[1] } }
  ];

  const result = await geminiModel.generateContentStream({ contents: [{ role: "user", parts }] });

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text();
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