import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { extractAudio } from '@/services/audioExtractor';

export async function POST(request: NextRequest) {
    try {
        const { videoId, filename } = await request.json();

        if (!videoId || !filename) {
            return NextResponse.json(
                { error: 'Missing videoId or filename' },
                { status: 400 }
            );
        }

        const videoPath = path.join(
            process.cwd(),
            'public',
            'uploads',
            'videos',
            filename
        );

        const result = await extractAudio(videoPath, videoId);

        if (result.success) {
            return NextResponse.json({
                success: true,
                audioPath: result.audioPath,
            });
        } else {
            return NextResponse.json(
                { error: result.error || 'Extraction failed' },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error('API Error (Extract Audio):', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
