import { useEffect, useRef, useState } from "react";
import z from "zod";
import { MODEL, streamArticleForTopic, streamAsciiArtForTopic } from "./ai";
import "opentui-spinner/react";
import { renderer } from ".";
import { ArticlePanel } from "./components/article-panel";
import { SearchBar } from "./components/search-bar";
import { TopicArtPanel } from "./components/topic-art-panel";

const FALLBACK_ARTICLE =
  "Mono is a word element and standalone term with several related meanings centered on the idea of “one” or “single.” It comes from the Greek word monos, meaning “alone” or “single,” and appears in many English words such as monologue, monochrome, and monorail. ";

const FALLBACK_ASCII_ART = `┌─────────────────────────────┐\n│█┌─────────────────────────┐█│\n│█│▓┌─────────────────────┐▓│█│\n│█│▓│▒┌─────────────────┐▒│▓│█│\n│█│▓│▒│░┌─────────────┐░│▒│▓│█│\n│█│▓│▒│░│ ┌─────────┐ │░│▒│▓│█│\n│█│▓│▒│░│ │ ┌─────┐ │ │░│▒│▓│█│\n│█│▓│▒│░│ │ │ ┌─■ │ │ │░│▒│▓│█│\n│█│▓│▒│░│ │ │ └───┘ │ │░│▒│▓│█│\n│█│▓│▒│░│ │ └───────┘ │░│▒│▓│█│\n│█│▓│▒│░│ └───────────┘░│▒│▓│█│\n│█│▓│▒│░└───────────────┘▒│▓│█│\n│█│▓│▒└───────────────────┘▓│█│\n│█│▓└───────────────────────┘█│\n■█└───────────────────────────┘`;

export default function App() {
  const [article, setArticle] = useState(FALLBACK_ARTICLE);
  const [topic, setTopic] = useState("mono");
  const [asciiArt, setAsciiArt] = useState(FALLBACK_ASCII_ART);
  const [input, setInput] = useState("");
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(0);
  const articleRef = useRef(article);
  const selectedWordIndexRef = useRef(selectedWordIndex);

  const [isArticleLoading, setIsArticleLoading] = useState(false);
  const [isArticleStreaming, setIsArticleStreaming] = useState(false);
  const [isAsciiArtLoading, setIsAsciiArtLoading] = useState(false);
  const isLoading = isArticleLoading || isAsciiArtLoading;
  const [error, setError] = useState<string | null>(null);
  const latestRequestId = useRef(0);
  const isMounted = useRef(true);

  useEffect(() => {
    articleRef.current = article;
  }, [article]);

  useEffect(() => {
    selectedWordIndexRef.current = selectedWordIndex;
  }, [selectedWordIndex]);

  useEffect(() => {
    renderer.keyInput.on("keypress", (key) => {
      // Toggle with backtick key
      if (key.name === "`") {
        renderer.console.toggle();
      }

      // Or with a modifier
      if (key.ctrl && key.name === "l") {
        renderer.console.toggle();
      }

      if (key.shift && key.name === "tab") {
        setSelectedWordIndex((prev) => {
          return prev - 1;
        });
      } else if (key.name === "tab") {
        setSelectedWordIndex((prev) => {
          return prev + 1;
        });
      }

      if (key.name === "enter" || key.name === "return") {
        const words = Array.from(
          articleRef.current.matchAll(/\S+\s*/g),
          (match) => match[0],
        );
        if (words.length === 0) {
          return;
        }

        const normalizedSelectedWordIndex =
          ((selectedWordIndexRef.current % words.length) + words.length) %
          words.length;
        const selectedWord = words[normalizedSelectedWordIndex]?.trim();

        if (selectedWord) {
          void onSubmit(selectedWord);
        }
      }
    });
    return () => {
      isMounted.current = false;
    };
  }, []);

  const onSubmit = async (submission: string) => {
    setIsArticleLoading(true);
    setIsAsciiArtLoading(true);

    if (process.env.TESTING) {
      setTopic(submission);
      setArticle(FALLBACK_ARTICLE);
      setAsciiArt(FALLBACK_ASCII_ART);
      setTimeout(() => {
        setIsArticleLoading(false);
        setIsAsciiArtLoading(false);
      }, 1000);
      return;
    }

    const Submission = z
      .string()
      .trim()
      .regex(/^[a-zA-Z0-9 _-]*$/)
      .min(1, "Please enter a topic to search for.")
      .max(40, "Topic must be 40 characters or less.");
    const parsedSubmission = Submission.parse(submission);

    const requestId = ++latestRequestId.current;
    setError(null);
    setArticle("");
    setTopic(parsedSubmission);

    const consumeAsciiArtStream = async () => {
      const result = await streamAsciiArtForTopic(parsedSubmission);
      if (!isMounted.current || requestId !== latestRequestId.current) {
        return;
      }
      setIsAsciiArtLoading(false);
      setAsciiArt(result);
    };

    const consumeArticleStream = async () => {
      setIsArticleStreaming(true);
      for await (const delta of streamArticleForTopic(parsedSubmission)) {
        setIsArticleLoading(false);
        if (!isMounted.current || requestId !== latestRequestId.current) {
          break;
        }
        setArticle((prev) => prev + delta);
      }
      setIsArticleStreaming(false);
    };

    try {
      await Promise.all([consumeAsciiArtStream(), consumeArticleStream()]);
    } catch (error) {
      if (!isMounted.current || requestId !== latestRequestId.current) {
        return;
      }
      setError(
        error instanceof Error ? error.message : "Failed to generate article.",
      );
      setArticle(FALLBACK_ARTICLE);
    } finally {
      if (isMounted.current && requestId === latestRequestId.current) {
        setIsArticleLoading(false);
        setIsAsciiArtLoading(false);
      }
    }
  };

  return (
    <box
      width="100%"
      height="100%"
      paddingX={2}
      paddingTop={1}
      backgroundColor="#FFFFFF"
      border
      borderColor="#888888"
      bottomTitle={` Made by Luca Wang · Generated by ${MODEL.modelId} `}
      justifyContent="center"
      alignItems="center"
      flexGrow={1}
    >
      <box flexDirection="column" gap={2} flexGrow={1}>
        <SearchBar
          input={input}
          onChange={setInput}
          onClear={() => setInput("")}
          onSubmit={(submission) => {
            if (typeof submission === "string") {
              void onSubmit(submission);
            }
          }}
        />

        <box
          width="100%"
          flexDirection="row"
          gap={3}
          alignItems="flex-start"
          justifyContent="center"
        >
          <TopicArtPanel
            asciiArt={asciiArt}
            isAsciiArtLoading={isAsciiArtLoading}
            isLoading={isLoading}
          />
          <ArticlePanel
            article={article}
            error={error}
            isArticleLoading={isArticleLoading}
            isArticleStreaming={isArticleStreaming}
            topic={topic}
            selectedWordIndex={selectedWordIndex}
          />
        </box>
      </box>
    </box>
  );
}
