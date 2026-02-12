'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';

const FONT_FAMILIES = [
    'Inter, sans-serif',
    'Roboto, sans-serif',
    'Open Sans, sans-serif',
    'Montserrat, sans-serif',
    'Arvo, serif',
    'Bangers, system-ui',
];

export default function WordStylePanel() {
    const {
        lines,
        selectedWord,
        updateWordStyle,
        clearSelection,
        projectId,
        projectName,
        saveCurrentProject,
        initProject
    } = useEditorStore();

    // Initialize project if none exists
    React.useEffect(() => {
        if (!projectId) {
            initProject('New Subtitle Project');
        }
    }, [projectId, initProject]);

    if (!selectedWord) {
        return (
            <div className="fixed right-4 top-1/2 -translate-y-1/2 w-80 bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl z-50 flex flex-col gap-6">
                <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Project</label>
                        <h3 className="text-white font-medium truncate">{projectName}</h3>
                    </div>
                    <button
                        onClick={saveCurrentProject}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                        Save Project
                    </button>
                    <p className="text-[10px] text-slate-500 text-center italic">
                        Select a word on the canvas to edit its style
                    </p>
                </div>
            </div>
        );
    }

    const activeLine = lines.find((l) => l.id === selectedWord.lineId);
    const word = activeLine?.words[selectedWord.wordIndex];

    if (!word) return null;

    return (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 w-80 bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl z-50 flex flex-col gap-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-white">Edit Word</h3>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest leading-none">{projectName}</span>
                </div>
                <button
                    onClick={clearSelection}
                    className="text-slate-400 hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>
            {/* ... style controls ... */}
            <div className="space-y-4">
                {/* Save Button also here for convenience */}
                <button
                    onClick={saveCurrentProject}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-white/5 transition-all mb-4"
                >
                    Save Changes
                </button>
                {/* Font Family */}
                {/* ... existing style controls ... */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Font Family</label>
                    <select
                        value={word.fontFamily}
                        onChange={(e) => updateWordStyle({ fontFamily: e.target.value })}
                        className="bg-slate-800 text-white rounded-lg px-3 py-2 border border-white/5 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                    >
                        {FONT_FAMILIES.map((font) => (
                            <option key={font} value={font}>{font.split(',')[0]}</option>
                        ))}
                    </select>
                </div>

                {/* Font Size */}
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Font Size</label>
                        <span className="text-xs font-mono text-blue-400">{word.fontSize}px</span>
                    </div>
                    <input
                        type="range"
                        min="12"
                        max="120"
                        value={word.fontSize}
                        onChange={(e) => updateWordStyle({ fontSize: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                {/* Color */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Text Color</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={word.color}
                            onChange={(e) => updateWordStyle({ color: e.target.value })}
                            className="w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer"
                        />
                        <span className="text-sm font-mono text-slate-300 uppercase">{word.color}</span>
                    </div>
                </div>

                {/* Typography Toggles */}
                <div className="flex justify-between pt-2">
                    <button
                        onClick={() => updateWordStyle({ bold: !word.bold })}
                        className={`w-12 h-10 flex items-center justify-center rounded-lg border transition-all ${word.bold ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 border-white/5 text-slate-400 hover:border-white/20'}`}
                    >
                        <span className="font-bold">B</span>
                    </button>
                    <button
                        onClick={() => updateWordStyle({ italic: !word.italic })}
                        className={`w-12 h-10 flex items-center justify-center rounded-lg border transition-all ${word.italic ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 border-white/5 text-slate-400 hover:border-white/20'}`}
                    >
                        <span className="italic serif">I</span>
                    </button>
                    <button
                        onClick={() => updateWordStyle({ underline: !word.underline })}
                        className={`w-12 h-10 flex items-center justify-center rounded-lg border transition-all ${word.underline ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 border-white/5 text-slate-400 hover:border-white/20'}`}
                    >
                        <span className="underline">U</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
