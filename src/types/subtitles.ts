export interface Word {
    text: string;
    start: number;
    end: number;
}

export interface SubtitleSegment {
    start: number;
    end: number;
    words: Word[];
}

export interface SubtitleData {
    subtitles: SubtitleSegment[];
}
