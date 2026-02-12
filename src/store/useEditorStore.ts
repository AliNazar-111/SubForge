import { create } from 'zustand';
import { SubtitleLine } from '@/types/SubtitleLine';
import { SubtitleWord } from '@/types/SubtitleWord';

interface EditorState {
    lines: SubtitleLine[];
    selectedWord: { lineId: string; wordIndex: number } | null;

    setLines: (lines: SubtitleLine[]) => void;
    selectWord: (lineId: string, wordIndex: number) => void;
    updateWordStyle: (style: Partial<SubtitleWord>) => void;
    clearSelection: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    lines: [],
    selectedWord: null,

    setLines: (lines) => set({ lines }),

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

    clearSelection: () => set({ selectedWord: null }),
}));
