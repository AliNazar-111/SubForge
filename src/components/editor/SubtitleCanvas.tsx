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

    // Find the current active line
    const activeLine = useMemo(() => {
        return lines.find(
            (line) => currentTime >= line.startTime && currentTime <= line.endTime
        );
    }, [lines, currentTime]);

    // Track position for draggability (can be synced back to a state/DB later)
    const [position, setPosition] = useState({ x: stageWidth / 2, y: stageHeight * 0.8 });

    // Calculate word positions within the line for horizontal centering
    const renderedWords = useMemo(() => {
        if (!activeLine) return null;

        let currentX = 0;
        const spacing = 8 * scale;

        return activeLine.words.map((word, index) => {
            const isSelected = selectedWord?.lineId === activeLine.id && selectedWord?.wordIndex === index;
            const wordFontSize = word.fontSize * scale;

            // Approximate width for layout
            const wordWidth = (word.text.length * (wordFontSize * 0.6)) + (word.letterSpacing * scale);

            const element = (
                <Group key={`${activeLine.id}-word-grp-${index}`} x={currentX}>
                    {/* Selection Highlight */}
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
            );

            currentX += wordWidth + spacing;
            return element;
        });
    }, [activeLine, scale, selectedWord, selectWord]);

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
                        {renderedWords}
                    </Group>
                )}
            </Layer>
        </Stage>
    );
}
