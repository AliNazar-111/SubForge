'use client';

import React, { useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { timeToPixels, pixelsToTime, formatTime } from '@/utils/timeUtils';

export default function Timeline() {
    const { lines, currentTime, duration, setCurrentTime } = useEditorStore();
    const timelineRef = useRef<HTMLDivElement>(null);

    const handleScrub = (e: React.MouseEvent) => {
        if (!timelineRef.current) return;

        const rect = timelineRef.current.getBoundingClientRect();
        const scrollLeft = timelineRef.current.scrollLeft;
        const x = e.clientX - rect.left + scrollLeft;

        const newTime = Math.max(0, Math.min(duration, pixelsToTime(x)));
        setCurrentTime(newTime);
    };

    return (
        <div className="w-full bg-slate-900 border-t border-white/10 p-4 select-none">
            <div className="flex justify-between items-center mb-4 px-2">
                <span className="text-xs font-mono text-blue-400">{formatTime(currentTime)}</span>
                <span className="text-xs font-mono text-slate-500">{formatTime(duration)}</span>
            </div>

            <div
                ref={timelineRef}
                className="relative h-32 bg-slate-800/50 rounded-lg overflow-x-auto overflow-y-hidden border border-white/5 scrollbar-hide"
                onClick={handleScrub}
            >
                {/* Time Markers */}
                <div
                    className="absolute top-0 h-full border-r border-white/5 flex flex-col pointer-events-none"
                    style={{ width: timeToPixels(duration) }}
                >
                    {Array.from({ length: Math.ceil(duration) }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute border-l border-white/10 h-2 top-0"
                            style={{ left: timeToPixels(i) }}
                        >
                            <span className="text-[10px] text-slate-600 ml-1">{i}s</span>
                        </div>
                    ))}
                </div>

                {/* Subtitle Blocks */}
                <div className="relative h-24 mt-6">
                    {lines.map((line) => (
                        <div
                            key={line.id}
                            className="absolute h-12 bg-blue-500/20 border border-blue-400/50 rounded-md flex items-center px-2 cursor-move group hover:bg-blue-500/30 transition-colors shadow-lg shadow-blue-500/5"
                            style={{
                                left: timeToPixels(line.startTime),
                                width: timeToPixels(line.endTime - line.startTime),
                            }}
                        >
                            <span className="text-[10px] text-blue-200 truncate font-medium">
                                {line.words.map(w => w.text).join(' ')}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Playhead (Scrubber) */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                    style={{ left: timeToPixels(currentTime) }}
                >
                    <div className="absolute top-[-4px] left-[-4px] w-2.5 h-2.5 bg-red-500 rotate-45 rounded-sm" />
                </div>
            </div>
        </div>
    );
}
