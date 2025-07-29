import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/configs/db';
import { desc, eq } from "drizzle-orm";
import { WireframeToCodeTable } from '@/configs/schema';

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

        // Insert into WireframeToCodeTable
        const result = await db.insert(WireframeToCodeTable).values({
            uid: uid,
            imageUrl: imageUrl,
            model: model,
            description: description,
            code: null, // Initialize as null instead of empty object
            createdBy: email
        }).returning();

        return NextResponse.json({ 
            success: true,
            data: result
        });

    } catch (error: any) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to save to database' },
            { status: 500 }
        );
    }
}export async function GET(req: Request) {
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
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}