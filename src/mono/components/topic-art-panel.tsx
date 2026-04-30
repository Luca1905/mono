import { BlinkingBox } from "./blinking-box";

type TopicArtPanelProps = {
  asciiArt: string;
  isAsciiArtLoading: boolean;
  isLoading: boolean;
  focused: boolean;
};

export function TopicArtPanel({
  asciiArt,
  isAsciiArtLoading,
  isLoading,
  focused,
}: TopicArtPanelProps) {
  return (
    <BlinkingBox
      flexShrink={0}
      alignItems="center"
      justifyContent="center"
      flexDirection="row"
      focused={focused}
      pulseDurationMs={500}
      baseIntensity={0}
      peakIntensity={255}
    >
      {isAsciiArtLoading && (
        <box
          backgroundColor="#FFFFFF"
          zIndex={1}
          position="absolute"
          flexDirection="row"
          alignItems="center"
          padding={1}
        >
          <spinner name="bouncingBall" color="grey" />
        </box>
      )}
      <text zIndex={0} fg={isLoading ? "#ffffff" : "#888888"}>
        {asciiArt}
      </text>
    </BlinkingBox>
  );
}
