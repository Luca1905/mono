import { BlinkingBox } from "./blinking-box";

type SearchBarProps = {
  input: string;
  searchFocused: boolean;
  onSubmit: (submission: string) => void;
};

export function SearchBar({ input, searchFocused, onSubmit }: SearchBarProps) {
  return (
    <box flexDirection="row" alignItems="center" justifyContent="space-between">
      <BlinkingBox
        active={searchFocused}
        pulseDurationMs={500}
        baseIntensity={255}
        peakIntensity={0}
        flexGrow={1}
      >
        <input
          value={input}
          placeholder="Start typing to search"
          textColor="#000000"
          onSubmit={(submission) => {
            if (typeof submission === "string") {
              onSubmit(submission);
            }
          }}
          focused={searchFocused}
        />
      </BlinkingBox>
      <box>
        <text selectable={false} fg="#000000">
          Random (Shift + r)
        </text>
      </box>
    </box>
  );
}
