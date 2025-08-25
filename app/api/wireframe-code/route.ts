import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/configs/db';
import { desc, eq } from "drizzle-orm";
import { WireframeToCodeTable } from '@/configs/schema';
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 300;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { uid, description, imageUrl, model, email } = body;

        if (!uid || !description || !imageUrl || !model || !email) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
        }
        const imageBuffer = await imageResponse.arrayBuffer();
        const imageBase64 = Buffer.from(imageBuffer).toString("base64");
        const imageMimeType = imageResponse.headers.get('content-type');

        if (!imageMimeType) {
            return NextResponse.json({ error: 'Failed to get image mime type' }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: imageMimeType,
            },
        };

        // Use the correct API structure for the new SDK
        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash-001", // or "gemini-1.5-flash" for older model
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: description },
                        imagePart
                    ]
                }
            ]
        });
        
        const codeResp = result.text;

        if (!codeResp) {
            return NextResponse.json({ error: 'Failed to generate code from model' }, { status: 500 });
        }

        // Insert into WireframeToCodeTable
        const dbResult = await db.insert(WireframeToCodeTable).values({
            uid: uid,
            imageUrl: imageUrl,
            model: model,
            description: description,
            code: codeResp,
            createdBy: email
        }).returning();

        return NextResponse.json({
            success: true,
            data: dbResult[0]
        });

    } catch (error: any) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process request' },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    const reqUrl = req.url;
    const { searchParams } = new URL(reqUrl);
    const uid = searchParams?.get('uid');
    const email = searchParams?.get('email');

    try {
        if (uid) {
            const result = await db.select()
                .from(WireframeToCodeTable)
                .where(eq(WireframeToCodeTable.uid, uid));
            
            if (result.length === 0) {
                return NextResponse.json({ error: 'Record not found' }, { status: 404 });
            }
            
            return NextResponse.json(result[0]);
        }
        else if (email) {
            const result = await db.select()
                .from(WireframeToCodeTable)
                .where(eq(WireframeToCodeTable.createdBy, email))
                .orderBy(desc(WireframeToCodeTable.id));

            return NextResponse.json(result);
        }

        return NextResponse.json({ error: 'Missing uid or email parameter' }, { status: 400 });
    } catch (error) {
        console.error('GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { uid, codeResp } = await req.json();

        if (!uid || !codeResp) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await db.update(WireframeToCodeTable)
            .set({
                code: codeResp
            })
            .where(eq(WireframeToCodeTable.uid, uid))
            .returning({ uid: WireframeToCodeTable.uid });

        if (result.length === 0) {
            return NextResponse.json({ error: 'Record not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error('PUT error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}