type TopicArtPanelProps = {
  asciiArt: string;
  isAsciiArtLoading: boolean;
  isLoading: boolean;
};

export function TopicArtPanel({
  asciiArt,
  isAsciiArtLoading,
  isLoading,
}: TopicArtPanelProps) {
  return (
    <box
      flexShrink={0}
      alignItems="center"
      justifyContent="center"
      flexDirection="row"
    >
      {isAsciiArtLoading && (
        <box
          backgroundColor="#FFFFFF"
          zIndex={1}
          position="absolute"
          flexDirection="row"
          alignItems="center"
          padding={1}
          maxWidth={"50%"}
        >
          <spinner name="bouncingBall" color="grey" />
        </box>
      )}
      <text zIndex={0} fg={isLoading ? "#ffffff" : "#888888"}>
        {asciiArt}
      </text>
    </box>
  );
}
