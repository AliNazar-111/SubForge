import OpenAI from 'openai';
import fs from 'fs';
import { SubtitleData, SubtitleSegment, Word } from '@/types/subtitles';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSubtitles(
    audioPath: string,
    videoId: string
): Promise<SubtitleData> {
    const file = fs.createReadStream(audioPath);

    const transcription = await openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['word', 'segment'],
    });

    const subtitles: SubtitleSegment[] = (transcription as any).segments.map((segment: any) => {
        // Find words that belong to this segment based on timestamps
        const segmentWords = (transcription as any).words.filter(
            (word: any) => word.start >= segment.start && word.end <= segment.end
        );

        return {
            start: segment.start,
            end: segment.end,
            words: segmentWords.map((w: any) => ({
                text: w.word,
                start: w.start,
                end: w.end,
            })),
        };
    });

    return {
        subtitles,
    };
}
