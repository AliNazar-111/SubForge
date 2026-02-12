export interface SubtitleWord {
    readonly text: string;
    readonly startTime: number;
    readonly endTime: number;
    readonly fontFamily: string;
    readonly fontSize: number;
    readonly color: string;
    readonly backgroundColor: string;
    readonly bold: boolean;
    readonly italic: boolean;
    readonly underline: boolean;
    readonly opacity: number;
    readonly letterSpacing: number;
}
