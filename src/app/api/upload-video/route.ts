import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { VideoMeta } from '@/types/video';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const metadataStr = formData.get('metadata') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (!metadataStr) {
            return NextResponse.json({ error: 'No metadata provided' }, { status: 400 });
        }

        const clientMetadata = JSON.parse(metadataStr);
        const videoId = crypto.randomUUID();
        const extension = path.extname(file.name);
        const fileName = `${videoId}${extension}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
        const filePath = path.join(uploadDir, fileName);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        await writeFile(filePath, buffer);

        const videoMeta: VideoMeta = {
            videoId,
            filename: fileName,
            duration: clientMetadata.duration,
            width: clientMetadata.width,
            height: clientMetadata.height,
            fps: clientMetadata.fps,
        };

        // In a real app, you'd save this to a database here.
        console.log('Video Metadata:', videoMeta);

        return NextResponse.json({ success: true, metadata: videoMeta });
    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
