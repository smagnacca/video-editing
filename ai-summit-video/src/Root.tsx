import { Composition } from "remotion";
import { MainComposition } from "./MainComposition";
import { VIDEO } from "./styles/theme";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MainComposition"
      component={MainComposition}
      durationInFrames={VIDEO.DURATION_FRAMES}
      fps={VIDEO.FPS}
      width={VIDEO.WIDTH}
      height={VIDEO.HEIGHT}
    />
  );
};
