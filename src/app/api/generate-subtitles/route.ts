import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { generateSubtitles } from '@/services/subtitleGenerator';

export async function POST(request: NextRequest) {
    try {
        const { videoId, audioPath } = await request.json();

        if (!videoId || !audioPath) {
            return NextResponse.json(
                { error: 'Missing videoId or audioPath' },
                { status: 400 }
            );
        }

        const absoluteAudioPath = path.join(process.cwd(), 'public', audioPath);
        const subtitles = await generateSubtitles(absoluteAudioPath, videoId);

        return NextResponse.json(subtitles);
    } catch (error: any) {
        console.error('API Error (Generate Subtitles):', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
