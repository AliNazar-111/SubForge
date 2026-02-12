'use client';

import React, { useMemo, useState } from 'react';
import { Stage, Layer, Group, Text, Rect } from 'react-konva';
import { useEditorStore } from '@/store/useEditorStore';

interface SubtitleCanvasProps {
    currentTime: number;
    stageWidth: number;
    stageHeight: number;
    videoWidth: number;
    videoHeight: number;
}

export default function SubtitleCanvas({
    currentTime,
    stageWidth,
    stageHeight,
    videoWidth,
    videoHeight,
}: SubtitleCanvasProps) {
    const { lines, selectedWord, selectWord } = useEditorStore();
    // Determine scaling factor to map video coordinates to canvas coordinates
    const scale = stageWidth / videoWidth;

    // Find the current active line using Binary Search for performance with long videos
    const activeLine = useMemo(() => {
        let low = 0;
        let high = lines.length - 1;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const line = lines[mid];

            if (currentTime >= line.startTime && currentTime <= line.endTime) {
                return line;
            } else if (currentTime < line.startTime) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return null;
    }, [lines, currentTime]);

    // Track position for draggability
    const [position, setPosition] = useState({ x: stageWidth / 2, y: stageHeight * 0.8 });

    // Detection for RTL languages like Urdu/Arabic
    const isRTL = useMemo(() => {
        if (!activeLine) return false;
        const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
        return activeLine.words.some(w => rtlRegex.test(w.text));
    }, [activeLine]);

    // Memoize word rendering to only update when the line changes
    const subtitleGroup = useMemo(() => {
        if (!activeLine) return null;

        const maxWidth = stageWidth * 0.8;
        const spacing = 8 * scale;
        const linePadding = 1.2;

        const lines: { words: any[], width: number }[] = [{ words: [], width: 0 }];
        let currentLineIndex = 0;

        activeLine.words.forEach((word, index) => {
            const isSelected = selectedWord?.lineId === activeLine.id && selectedWord?.wordIndex === index;
            const wordFontSize = word.fontSize * scale;
            // Approximate width - in a real app, we might use a hidden canvas measureText
            const wordWidth = (word.text.length * (wordFontSize * 0.6)) + (word.letterSpacing * scale);

            if (lines[currentLineIndex].width + wordWidth + spacing > maxWidth && lines[currentLineIndex].words.length > 0) {
                currentLineIndex++;
                lines[currentLineIndex] = { words: [], width: 0 };
            }

            const wordElement = {
                element: (
                    <Group key={`${activeLine.id}-word-grp-${index}`} x={lines[currentLineIndex].width}>
                        {isSelected && (
                            <Rect
                                width={wordWidth}
                                height={wordFontSize * 1.2}
                                y={-wordFontSize * 0.1}
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dash={[4, 2]}
                                cornerRadius={4}
                            />
                        )}
                        <Text
                            text={word.text}
                            fill={word.color}
                            fontFamily={word.fontFamily}
                            fontSize={wordFontSize}
                            fontStyle={`${word.bold ? 'bold' : ''} ${word.italic ? 'italic' : ''}`.trim()}
                            opacity={word.opacity}
                            textDecoration={word.underline ? 'underline' : ''}
                            letterSpacing={word.letterSpacing * scale}
                            onClick={() => selectWord(activeLine.id, index)}
                            onMouseEnter={(e) => {
                                const container = e.target.getStage()?.container();
                                if (container) container.style.cursor = 'pointer';
                            }}
                            onMouseLeave={(e) => {
                                const container = e.target.getStage()?.container();
                                if (container) container.style.cursor = 'default';
                            }}
                        />
                    </Group>
                ),
                width: wordWidth
            };

            lines[currentLineIndex].words.push(wordElement);
            lines[currentLineIndex].width += wordWidth + spacing;
        });

        // Final layout with RTL support and multi-line centering
        const totalHeight = lines.length * (activeLine.words[0]?.fontSize * scale * linePadding || 0);
        const totalWidth = Math.max(...lines.map(l => l.width));

        return (
            <Group
                x={0}
                y={0}
                offset={{ x: totalWidth / 2, y: totalHeight / 2 }}
            >
                {lines.map((line, lIdx) => (
                    <Group
                        key={`line-${lIdx}`}
                        y={lIdx * (activeLine.words[0]?.fontSize * scale * linePadding)}
                        x={isRTL ? totalWidth : (totalWidth - line.width) / 2}
                        scaleX={isRTL ? -1 : 1}
                    >
                        {line.words.map((w, wIdx) => (
                            <Group
                                key={`word-${lIdx}-${wIdx}`}
                                x={w.element.props.x}
                                scaleX={isRTL ? -1 : 1} // Flip text back since line is flipped
                                offset={{ x: isRTL ? w.width : 0, y: 0 }}
                            >
                                {w.element}
                            </Group>
                        ))}
                    </Group>
                ))}
            </Group>
        );
    }, [activeLine, scale, selectedWord, selectWord, stageWidth, isRTL]);

    return (
        <Stage width={stageWidth} height={stageHeight} className="absolute inset-0 z-10 pointer-events-none">
            <Layer>
                {activeLine && (
                    <Group
                        draggable
                        x={position.x}
                        y={position.y}
                        onDragEnd={(e) => {
                            setPosition({ x: e.target.x(), y: e.target.y() });
                        }}
                        offset={{
                            // Rough centering: this would be calculated properly with group.width() / 2
                            x: 0,
                            y: 0
                        }}
                        className="pointer-events-auto"
                    >
                        {subtitleGroup}
                    </Group>
                )}
            </Layer>
        </Stage>
    );
}
