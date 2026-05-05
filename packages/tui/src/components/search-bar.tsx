import { BlinkingBox } from "./blinking-box";

type SearchBarProps = {
  input: string;
  searchFocused: boolean;
  randomFocused: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit: (submission: string) => void;
};

export function SearchBar({
  input,
  searchFocused,
  randomFocused,
  onChange,
  onClear,
  onSubmit,
}: SearchBarProps) {
  return (
    <box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      focusable={false}
    >
      <BlinkingBox
        focusable
        focused={searchFocused}
        pulseDurationMs={500}
        baseIntensity={0}
        peakIntensity={255}
        flexGrow={1}
      >
        <input
          value={input}
          placeholder="Start typing to search"
          textColor="#000000"
          onKeyDown={(key) => {
            if (key.name === "escape") {
              onClear();
            }
          }}
          onChange={onChange}
          onSubmit={(submission) => {
            if (typeof submission === "string") {
              onSubmit(submission);
            }
          }}
          focused={searchFocused}
        />
      </BlinkingBox>
      <BlinkingBox
        focused={randomFocused}
        pulseDurationMs={500}
        baseIntensity={0}
        peakIntensity={255}
      >
        <text selectable={false} fg="#000000">
          Random (Shift + r)
        </text>
      </BlinkingBox>
    </box>
  );
}
