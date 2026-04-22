type SearchBarProps = {
  input: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit: (submission: string) => void;
};

export function SearchBar({
  input,
  onChange,
  onClear,
  onSubmit,
}: SearchBarProps) {
  return (
    <box flexDirection="row" justifyContent="space-between">
      <box flexGrow={1}>
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
          cursorColor="#888888"
          showCursor
          focused={false}
        />
      </box>
      <text selectable={false} fg="#000000">
        Random
      </text>
    </box>
  );
}
