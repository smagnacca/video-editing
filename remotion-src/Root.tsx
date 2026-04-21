import React from 'react';
import { Composition } from 'remotion';
import { VideoComposition, VideoProps } from './VideoComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoComposition"
        component={VideoComposition}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'My Video',
          subtitle: 'Created with Remotion + ElevenLabs',
          backgroundColor: '#0a0a0a',
          accentColor: '#4f8ef7',
        } as VideoProps}
      />
    </>
  );
};
