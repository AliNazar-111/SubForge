import { NextRequest, NextResponse } from 'next/server';
import { renderMedia, selectComposition, getVideoMetadata } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import { bundle } from '@remotion/bundler';
export async function POST(req: NextRequest) {
    try {
        const { projectId, subtitleLines, videoUrl: clientVideoUrl, width = 1920, height = 1080 } = await req.json();

        if (!subtitleLines || !clientVideoUrl) {
            return NextResponse.json({ error: 'Missing subtitleLines or videoUrl' }, { status: 400 });
        }

        // 1. Resolve video source
        // If it starts with /uploads, it's a local file relative to public
        let finalVideoSource = clientVideoUrl;
        if (clientVideoUrl.startsWith('/uploads/')) {
            finalVideoSource = path.join(process.cwd(), 'public', clientVideoUrl);
        }

        // 2. Get video metadata to determine duration/fps
        let metadata;
        try {
            metadata = await getVideoMetadata(finalVideoSource);
        } catch (e) {
            console.error('Failed to get video metadata for:', finalVideoSource, e);
            // Fallback
            metadata = { durationInSeconds: 10, fps: 30 };
        }

        // 3. Bundle the composition
        const entryPoint = path.join(process.cwd(), 'src/remotion/Root.tsx');

        // Ensure bundle is stable
        const bundleLocation = await bundle({
            entryPoint,
        });

        const compositionId = 'SubtitleRender';

        // 4. Select composition
        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: compositionId,
            inputProps: {
                videoUrl: finalVideoSource,
                subtitleLines
            },
        });

        // Override composition duration if we have metadata
        if (metadata.durationInSeconds) {
            composition.durationInFrames = Math.ceil(metadata.durationInSeconds * (metadata.fps || 30));
        }

        // 5. Define output path
        const outputDir = path.join(process.cwd(), 'public/renders');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputFilename = `render-${projectId || Date.now()}.mp4`;
        const outputPath = path.join(outputDir, outputFilename);

        // 6. Render
        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation: outputPath,
            inputProps: {
                videoUrl: finalVideoSource,
                subtitleLines
            },
        });

        return NextResponse.json({
            success: true,
            downloadUrl: `/renders/${outputFilename}`
        });

    } catch (error: any) {
        console.error('Render error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
