import React, { useEffect } from 'react';
import { AbsoluteFill, Video, Sequence, useVideoConfig, continueRender, delayRender } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadRoboto } from '@remotion/google-fonts/Roboto';
import { SubtitleLine } from '../types/SubtitleLine';

export interface SubtitleCompositionProps {
    videoUrl: string;
    subtitleLines: SubtitleLine[];
}

export const SubtitleComposition: React.FC<SubtitleCompositionProps> = ({
    videoUrl,
    subtitleLines,
}) => {
    const { fps } = useVideoConfig();

    // Load fonts
    useEffect(() => {
        const handle = delayRender('Loading fonts');

        Promise.all([
            loadInter(),
            loadRoboto(),
            // Add other fonts here as needed
        ]).then(() => {
            continueRender(handle);
        }).catch((err: any) => {
            console.error('Failed to load fonts:', err);
            continueRender(handle);
        });
    }, []);

    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            {videoUrl && <Video src={videoUrl} />}

            {subtitleLines.map((line) => {
                const startFrame = Math.round(line.startTime * fps);
                const durationInFrames = Math.max(1, Math.round((line.endTime - line.startTime) * fps));

                return (
                    <Sequence
                        key={line.id}
                        from={startFrame}
                        durationInFrames={durationInFrames}
                    >
                        <div style={{
                            position: 'absolute',
                            bottom: '15%',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.5em',
                            flexWrap: 'wrap',
                            padding: '0 5%',
                            textAlign: 'center'
                        }}>
                            {line.words.map((word, i) => (
                                <span
                                    key={i}
                                    style={{
                                        color: word.color,
                                        fontFamily: word.fontFamily,
                                        fontSize: `${word.fontSize * 1.5}px`,
                                        fontWeight: word.bold ? 'bold' : 'normal',
                                        fontStyle: word.italic ? 'italic' : 'normal',
                                        textDecoration: word.underline ? 'underline' : 'none',
                                        opacity: word.opacity,
                                        letterSpacing: `${word.letterSpacing}px`,
                                        textShadow: '0px 2px 4px rgba(0,0,0,0.8)'
                                    }}
                                >
                                    {word.text}
                                </span>
                            ))}
                        </div>
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
};
