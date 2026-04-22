import { TextAttributes } from "@opentui/core";
import { randomUUIDv7 } from "bun";

type ArticlePanelProps = {
  article: string;
  error: string | null;
  isArticleLoading: boolean;
  isArticleStreaming: boolean;
  selectedWordIndex: number;
  topic: string;
};

const WORD_TOKEN_REGEX = /\S+\s*/g;

function renderSelectableWords(article: string, selectedWordIndex: number) {
  console.log(selectedWordIndex);
  const words = Array.from(
    article.matchAll(WORD_TOKEN_REGEX),
    (match) => match[0],
  );

  return words.map((word, index) => {
    const idx =
      selectedWordIndex < 0
        ? words.length + selectedWordIndex
        : selectedWordIndex;
    return idx % words.length === index ? (
      <>
        <text
          key={randomUUIDv7()}
          fg="#000000"
          bg="#cccccc"
          attributes={TextAttributes.UNDERLINE}
        >
          {word.slice(0, -1)}
        </text>
        <text key={randomUUIDv7()} fg="#000000">
          {" "}
        </text>
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
}: ArticlePanelProps) {
  return (
    <box flexGrow={1} flexShrink={1} minWidth="30%" maxWidth="50%">
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
    </box>
  );
}
