import OpenAI from 'openai';
import fs from 'fs';
import { SubtitleWord } from '@/types/SubtitleWord';
import { SubtitleLine } from '@/types/SubtitleLine';
import { DEFAULT_SUBTITLE_STYLE } from '@/lib/constants';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSubtitles(
    audioPath: string,
    videoId: string
): Promise<{ subtitles: SubtitleLine[] }> {
    const file = fs.createReadStream(audioPath);

    const transcription = await openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['word', 'segment'],
    });

    const subtitles: SubtitleLine[] = (transcription as any).segments.map((segment: any, index: number) => {
        // Find words that belong to this segment based on timestamps
        const segmentWords = (transcription as any).words.filter(
            (word: any) => word.start >= segment.start && word.end <= segment.end
        );

        return {
            id: `line-${index}`,
            startTime: segment.start,
            endTime: segment.end,
            words: segmentWords.map((w: any) => ({
                text: w.word,
                startTime: w.start,
                endTime: w.end,
                ...DEFAULT_SUBTITLE_STYLE,
            })),
        };
    });

    return {
        subtitles,
    };
}
