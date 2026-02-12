'use client';

import React, { useMemo, useState } from 'react';
import { Stage, Layer, Group, Text } from 'react-konva';
import { SubtitleLine } from '@/types/SubtitleLine';

interface SubtitleCanvasProps {
    currentTime: number;
    lines: SubtitleLine[];
    stageWidth: number;
    stageHeight: number;
    videoWidth: number;
    videoHeight: number;
}

export default function SubtitleCanvas({
    currentTime,
    lines,
    stageWidth,
    stageHeight,
    videoWidth,
    videoHeight,
}: SubtitleCanvasProps) {
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
        const spacing = 4 * scale; // Minimal gap between words

        // Pre-calculate positions to center the group
        // Note: Real centering requires measuring text width, which Konva does after render
        // or using a hidden context. For now, we'll estimate and rely on Group centering.

        return activeLine.words.map((word, index) => {
            const wordElement = (
                <Text
                    key={`${activeLine.id}-word-${index}`}
                    text={word.text}
                    x={currentX}
                    fill={word.color}
                    fontFamily={word.fontFamily}
                    fontSize={word.fontSize * scale}
                    fontStyle={`${word.bold ? 'bold' : ''} ${word.italic ? 'italic' : ''}`.trim()}
                    opacity={word.opacity}
                    textDecoration={word.underline ? 'underline' : ''}
                    letterSpacing={word.letterSpacing * scale}
                />
            );
            // Rough estimation for next word position (real app would use word.width if calculated)
            // Simplified for initial implementation.
            currentX += (word.text.length * (word.fontSize * 0.6) + 10) * scale;
            return wordElement;
        });
    }, [activeLine, scale]);

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
