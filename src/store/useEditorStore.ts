import { create } from 'zustand';
import { SubtitleLine } from '@/types/SubtitleLine';
import { SubtitleWord } from '@/types/SubtitleWord';

interface EditorState {
    lines: SubtitleLine[];
    selectedWord: { lineId: string; wordIndex: number } | null;
    currentTime: number;
    duration: number;
    projectId: string | null;
    projectName: string;

    setLines: (lines: SubtitleLine[]) => void;
    selectWord: (lineId: string, wordIndex: number) => void;
    updateWordStyle: (style: Partial<SubtitleWord>) => void;
    clearSelection: () => void;

    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    updateLineTiming: (lineId: string, startTime: number, endTime: number) => void;

    // Project Actions
    initProject: (name: string) => void;
    loadProject: (id: string) => void;
    saveCurrentProject: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
    lines: [],
    selectedWord: null,
    currentTime: 0,
    duration: 0,
    projectId: null,
    projectName: 'Untitled Project',

    setLines: (lines: SubtitleLine[]) => set({ lines }),
    setCurrentTime: (currentTime: number) => set({ currentTime }),
    setDuration: (duration: number) => set({ duration }),

    selectWord: (lineId: string, wordIndex: number) => set({ selectedWord: { lineId, wordIndex } }),

    updateWordStyle: (style: Partial<SubtitleWord>) => set((state) => {
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

    updateLineTiming: (lineId: string, startTime: number, endTime: number) => set((state) => ({
        lines: state.lines.map((line) =>
            line.id === lineId ? { ...line, startTime, endTime } : line
        )
    })),

    clearSelection: () => set({ selectedWord: null }),

    initProject: (name: string) => set({
        projectId: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 10),
        projectName: name,
        lines: [],
        selectedWord: null
    }),

    loadProject: (id: string) => {
        const { loadProject: fetchProject } = require('@/services/projectStorage');
        const project = fetchProject(id);
        if (project) {
            set({
                projectId: project.id,
                projectName: project.name,
                lines: project.subtitleLines
            });
        }
    },

    saveCurrentProject: () => {
        const { projectId, projectName, lines } = get();
        if (!projectId) return;

        const { saveProject: persistProject } = require('@/services/projectStorage');
        persistProject({
            version: '1.0.0',
            id: projectId,
            name: projectName,
            subtitleLines: lines,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        });
        alert('Project saved successfully!');
    }
}));
