export function splitArticleIntoWords(article: string): string[] {
  const WORD_TOKEN_REGEX =
    /[A-Za-z0-9-]+(?:'[A-Za-z0-9-]+)?\s*|[^\sA-Za-z0-9-]+\s*/g;

  return Array.from(article.matchAll(WORD_TOKEN_REGEX), (match) => match[0]);
}
