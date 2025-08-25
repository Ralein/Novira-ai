import { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { description, imageUrl } = await req.json();

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    return new Response('Failed to fetch image', { status: 500 });
  }
  const imageBuffer = await imageResponse.arrayBuffer();
  const imageBase64 = Buffer.from(imageBuffer).toString('base64');
  const imageMimeType = imageResponse.headers.get('content-type');

  if (!imageMimeType) {
    return new Response('Failed to get image mime type', { status: 500 });
  }

  const imagePart = {
    inlineData: { mimeType: imageMimeType, data: imageBase64 },
  };
  const textPart = { text: description };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-04-17',  // example model
    contents: { parts: [textPart, imagePart] },
    config: { responseMimeType: 'application/json' },
  });

 const rawText = response.text;

if (!rawText) {
  return new Response('No text returned from AI model', { status: 500 });
}

let parsed: any;
try {
  parsed = JSON.parse(rawText);
} catch (e) {
  console.error('Failed to parse JSON:', e);
  console.error('Raw response:', rawText);
  return new Response('Invalid JSON from AI model', { status: 500 });
}

  return new Response(JSON.stringify(parsed), {
    headers: { 'Content-Type': 'application/json' },
  });
}