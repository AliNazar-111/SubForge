import { SubtitleLine } from './SubtitleLine';

export interface SubForgeProject {
    readonly version: string;
    readonly id: string;
    readonly name: string;
    readonly subtitleLines: SubtitleLine[];
    readonly createdAt: string;
    readonly lastModified: string;
    readonly videoMetadata?: {
        filename: string;
        duration: number;
        width: number;
        height: number;
    };
}
