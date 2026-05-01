import { splitArticleIntoWords } from "@mono/utils/words";
import { TextAttributes } from "@opentui/core";
import { randomUUIDv7 } from "bun";
import { BlinkingBox } from "./blinking-box";

type ArticlePanelProps = {
  article: string;
  error: string | null;
  isArticleLoading: boolean;
  isArticleStreaming: boolean;
  selectedWordIndex: number;
  focused: boolean;
  topic: string;
};

function renderSelectableWords(article: string, selectedWordIndex: number) {
  console.log(selectedWordIndex);
  const words = splitArticleIntoWords(article);

  return words.map((word, index) => {
    const idx =
      selectedWordIndex < 0
        ? words.length + selectedWordIndex
        : selectedWordIndex;
    const tokenText = word.replace(/\s+$/, "");
    const hasTrailingSpace = /\s$/.test(word);

    return idx % words.length === index ? (
      <>
        <text
          key={randomUUIDv7()}
          fg="#000000"
          bg="#cccccc"
          attributes={TextAttributes.UNDERLINE}
        >
          {tokenText}
        </text>
        {hasTrailingSpace ? (
          <text key={randomUUIDv7()} fg="#000000">
            {" "}
          </text>
        ) : null}
      </>
    ) : (
      <text key={randomUUIDv7()} fg="#000000">
        {word}
      </text>
    );
  });
}

export function ArticlePanel({
  article,
  error,
  isArticleLoading,
  isArticleStreaming,
  topic,
  selectedWordIndex,
  focused,
}: ArticlePanelProps) {
  return (
    <BlinkingBox
      flexShrink={1}
      flexGrow={1}
      minWidth="30%"
      maxWidth="50%"
      focusable
      focused={focused}
      pulseDurationMs={500}
      baseIntensity={0}
      peakIntensity={255}
    >
      <box
        flexDirection="column"
        alignItems="flex-start"
        marginBottom={2}
        flexGrow={1}
        flexShrink={1}
      >
        <ascii-font text={topic} font="block" color="#000000" flexShrink={1} />
      </box>
      {isArticleLoading ? <text fg="#888888">Generating...</text> : null}
      {error ? <text fg="#FF0000">Error: {error}</text> : null}
      {isArticleStreaming ? (
        <text fg="#000000" flexShrink={1}>
          {article}
        </text>
      ) : article ? (
        <box flexDirection="row" flexWrap="wrap" width="100%">
          {renderSelectableWords(article, selectedWordIndex)}
        </box>
      ) : null}
    </BlinkingBox>
  );
}
