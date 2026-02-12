import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { SubtitleComposition } from './SubtitleComposition';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="SubtitleRender"
                component={SubtitleComposition}
                durationInFrames={300} // Default, will be overridden
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    videoUrl: '',
                    subtitleLines: []
                }}
            />
        </>
    );
};

registerRoot(RemotionRoot);
