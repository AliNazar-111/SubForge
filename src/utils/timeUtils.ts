export const PIXELS_PER_SECOND = 100;

export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export function timeToPixels(time: number): number {
    return time * PIXELS_PER_SECOND;
}

export function pixelsToTime(pixels: number): number {
    return pixels / PIXELS_PER_SECOND;
}
