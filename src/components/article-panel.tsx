type ArticlePanelProps = {
  article: string;
  error: string | null;
  isArticleLoading: boolean;
  topic: string;
};

export function ArticlePanel({
  article,
  error,
  isArticleLoading,
  topic,
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
      <text selectionBg="#888888" selectable fg="#000000" flexShrink={1}>
        {article}
      </text>
    </box>
  );
}
