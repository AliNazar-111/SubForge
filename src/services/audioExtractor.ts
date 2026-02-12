import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

// Set ffmpeg path if not already set by ffmpeg-static (fluent-ffmpeg usually finds it, but being explicit is safer)
import ffmpegStatic from 'ffmpeg-static';
if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
}

export interface ExtractionResult {
    success: boolean;
    audioPath?: string;
    error?: string;
}

export async function extractAudio(
    videoPath: string,
    videoId: string
): Promise<ExtractionResult> {
    return new Promise((resolve) => {
        const outputDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
        const outputPath = path.join(outputDir, `${videoId}.wav`);

        // Ensure output directory exists
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        ffmpeg(videoPath)
            .toFormat('wav')
            .audioChannels(1)
            .audioFrequency(16000)
            .on('end', () => {
                console.log(`Audio extraction finished: ${outputPath}`);
                resolve({
                    success: true,
                    audioPath: `/uploads/audio/${videoId}.wav`,
                });
            })
            .on('error', (err) => {
                console.error('Error extracting audio:', err);
                resolve({
                    success: false,
                    error: err.message,
                });
            })
            .save(outputPath);
    });
}
