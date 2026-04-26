import { BlinkingBox } from "./blinking-box";

type SearchBarProps = {
  input: string;
  focused: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit: (submission: string) => void;
};

export function SearchBar({
  input,
  focused,
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
        focused={focused}
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
          focused={false}
        />
      </BlinkingBox>
      <BlinkingBox
        focusable
        focused={focused}
        pulseDurationMs={500}
        baseIntensity={0}
        peakIntensity={255}
      >
        <text selectable={false} fg="#000000">
          Random
        </text>
      </BlinkingBox>
    </box>
  );
}
