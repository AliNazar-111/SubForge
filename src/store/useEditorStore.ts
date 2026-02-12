import { create } from 'zustand';
import { SubtitleLine } from '@/types/SubtitleLine';
import { SubtitleWord } from '@/types/SubtitleWord';

interface EditorState {
    lines: SubtitleLine[];
    selectedWord: { lineId: string; wordIndex: number } | null;
    currentTime: number;
    duration: number;

    setLines: (lines: SubtitleLine[]) => void;
    selectWord: (lineId: string, wordIndex: number) => void;
    updateWordStyle: (style: Partial<SubtitleWord>) => void;
    clearSelection: () => void;

    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    updateLineTiming: (lineId: string, startTime: number, endTime: number) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    lines: [],
    selectedWord: null,
    currentTime: 0,
    duration: 0,

    setLines: (lines) => set({ lines }),
    setCurrentTime: (currentTime) => set({ currentTime }),
    setDuration: (duration) => set({ duration }),

    selectWord: (lineId, wordIndex) => set({ selectedWord: { lineId, wordIndex } }),

    updateWordStyle: (style) => set((state) => {
        if (!state.selectedWord) return state;

        const { lineId, wordIndex } = state.selectedWord;
        const newLines = state.lines.map((line) => {
            if (line.id !== lineId) return line;

            const newWords = [...line.words];
            newWords[wordIndex] = { ...newWords[wordIndex], ...style };
            return { ...line, words: newWords };
        });

        return { lines: newLines };
    }),

    updateLineTiming: (lineId, startTime, endTime) => set((state) => ({
        lines: state.lines.map((line) =>
            line.id === lineId ? { ...line, startTime, endTime } : line
        )
    })),

    clearSelection: () => set({ selectedWord: null }),
}));
