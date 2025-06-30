import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { file, fileName } = body;

        if (!file || !fileName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const uploadResponse = await imagekit.upload({
            file: file,
            fileName: fileName,
            useUniqueFileName: true
        });
        console.log(uploadResponse);
        return NextResponse.json({
            url: uploadResponse.url,
            fileId: uploadResponse.fileId
        });

    } catch (error: any) {
        console.error('ImageKit upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Upload failed' },
            { status: 500 }
        );
    }
}