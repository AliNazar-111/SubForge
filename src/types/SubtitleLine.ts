import { SubtitleWord } from './SubtitleWord';

export interface SubtitleLine {
    readonly id: string;
    readonly startTime: number;
    readonly endTime: number;
    readonly words: readonly SubtitleWord[];
}
