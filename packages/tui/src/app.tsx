import { useCallback, useEffect, useRef, useState } from "react";
import z from "zod";
import { MODEL, streamArticleForTopic, streamAsciiArtForTopic } from "./ai";
import "opentui-spinner/react";
import { useKeyboard } from "@opentui/react";
import { renderer } from ".";
import { ArticlePanel } from "./components/article-panel";
import { SearchBar } from "./components/search-bar";
import { TopicArtPanel } from "./components/topic-art-panel";
import { splitArticleIntoWords } from "./utils/words";

type focusableElementId = "input" | "article";

const PREDEFINED_WORDS = [
  "Balance",
  "Harmony",
  "Discord",
  "Unity",
  "Fragmentation",
  "Clarity",
  "Ambiguity",
  "Presence",
  "Absence",
  "Creation",
  "Destruction",
  "Light",
  "Shadow",
  "Beginning",
  "Ending",
  "Rising",
  "Falling",
  "Connection",
  "Isolation",
  "Hope",
  "Despair",
  "Order and chaos",
  "Light and shadow",
  "Sound and silence",
  "Form and formlessness",
  "Being and nonbeing",
  "Presence and absence",
  "Motion and stillness",
  "Unity and multiplicity",
  "Finite and infinite",
  "Sacred and profane",
  "Memory and forgetting",
  "Question and answer",
  "Search and discovery",
  "Journey and destination",
  "Dream and reality",
  "Time and eternity",
  "Self and other",
  "Known and unknown",
  "Spoken and unspoken",
  "Visible and invisible",
  "Zigzag",
  "Waves",
  "Spiral",
  "Bounce",
  "Slant",
  "Drip",
  "Stretch",
  "Squeeze",
  "Float",
  "Fall",
  "Spin",
  "Melt",
  "Rise",
  "Twist",
  "Explode",
  "Stack",
  "Mirror",
  "Echo",
  "Vibrate",
  "Gravity",
  "Friction",
  "Momentum",
  "Inertia",
  "Turbulence",
  "Pressure",
  "Tension",
  "Oscillate",
  "Fractal",
  "Quantum",
  "Entropy",
  "Vortex",
  "Resonance",
  "Equilibrium",
  "Centrifuge",
  "Elastic",
  "Viscous",
  "Refract",
  "Diffuse",
  "Cascade",
  "Levitate",
  "Magnetize",
  "Polarize",
  "Accelerate",
  "Compress",
  "Undulate",
  "Liminal",
  "Ephemeral",
  "Paradox",
  "Zeitgeist",
  "Metamorphosis",
  "Synesthesia",
  "Recursion",
  "Emergence",
  "Dialectic",
  "Apophenia",
  "Limbo",
  "Flux",
  "Sublime",
  "Uncanny",
  "Palimpsest",
  "Chimera",
  "Void",
  "Transcend",
  "Ineffable",
  "Qualia",
  "Gestalt",
  "Simulacra",
  "Abyssal",
  "Existential",
  "Nihilism",
  "Solipsism",
  "Phenomenology",
  "Hermeneutics",
  "Deconstruction",
  "Postmodern",
  "Absurdism",
  "Catharsis",
  "Epiphany",
  "Melancholy",
  "Nostalgia",
  "Longing",
  "Reverie",
  "Pathos",
  "Ethos",
  "Logos",
  "Mythos",
  "Anamnesis",
  "Intertextuality",
  "Metafiction",
  "Stream",
  "Lacuna",
  "Caesura",
  "Enjambment",
];
const UNIQUE_WORDS = [...new Set(PREDEFINED_WORDS)];

const FALLBACK_ARTICLE =
  "Mono is a word element and standalone term with several related meanings centered on the idea of “one” or “single.” It comes from the Greek word monos, meaning “alone” or “single,” and appears in many English words such as monologue, monochrome, and monorail. ";

const FALLBACK_ASCII_ART = `┌─────────────────────────────┐\n│█┌─────────────────────────┐█│\n│█│▓┌─────────────────────┐▓│█│\n│█│▓│▒┌─────────────────┐▒│▓│█│\n│█│▓│▒│░┌─────────────┐░│▒│▓│█│\n│█│▓│▒│░│ ┌─────────┐ │░│▒│▓│█│\n│█│▓│▒│░│ │ ┌─────┐ │ │░│▒│▓│█│\n│█│▓│▒│░│ │ │ ┌─■ │ │ │░│▒│▓│█│\n│█│▓│▒│░│ │ │ └───┘ │ │░│▒│▓│█│\n│█│▓│▒│░│ │ └───────┘ │░│▒│▓│█│\n│█│▓│▒│░│ └───────────┘░│▒│▓│█│\n│█│▓│▒│░└───────────────┘▒│▓│█│\n│█│▓│▒└───────────────────┘▓│█│\n│█│▓└───────────────────────┘█│\n■█└───────────────────────────┘`;

export default function App() {
  const focusableElements: focusableElementId[] = ["input", "article"];
  const [focused, setFocused] = useState<focusableElementId>("article");
  const [article, setArticle] = useState(FALLBACK_ARTICLE);
  const [topic, setTopic] = useState("mono");
  const [asciiArt, setAsciiArt] = useState(FALLBACK_ASCII_ART);
  const [input, setInput] = useState("");
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(0);

  const [isArticleLoading, setIsArticleLoading] = useState(false);
  const [isArticleStreaming, setIsArticleStreaming] = useState(false);
  const [isAsciiArtLoading, setIsAsciiArtLoading] = useState(false);
  const isLoading = isArticleLoading || isAsciiArtLoading;
  const [error, setError] = useState<string | null>(null);
  const latestRequestId = useRef(0);
  const isMounted = useRef(true);

  useEffect(() => {
    console.log(input);
  }, [input]);

  useKeyboard((key) => {
    // GLOBAL SHORTCUTS
    if (key.name === "`" || (key.ctrl && key.name === "l")) {
      renderer.console.toggle();
    }

    if (key.shift && key.name === "r") {
      handleRandomTopic();
    }

    if (key.name === "tab") {
      setFocused((prev) => {
        const currentIndex = focusableElements.indexOf(prev);
        const nextIndex = (currentIndex + 1) % focusableElements.length;
        const newFocused = focusableElements[nextIndex];
        if (!newFocused) {
          return prev;
        }
        return newFocused;
      });
    }

    switch (focused) {
      case "input":
        if (key.name === "escape") {
          setInput("");
        }
        break;

      case "article":
        // navigation
        if (key.name === "h" || key.name === "left") {
          setSelectedWordIndex((prev) => {
            return prev - 1;
          });
        }
        if (key.name === "l" || key.name === "right") {
          setSelectedWordIndex((prev) => {
            return prev + 1;
          });
        }
        if (key.name === "j" || key.name === "down") {
          setSelectedWordIndex((prev) => {
            return prev + 5;
          });
        }
        if (key.name === "k" || key.name === "up") {
          setSelectedWordIndex((prev) => {
            return prev - 5;
          });
        }

        if (key.name === "enter" || key.name === "return") {
          const words = splitArticleIntoWords(article);
          if (words.length === 0) {
            return;
          }

          const normalizedSelectedWordIndex =
            ((selectedWordIndex % words.length) + words.length) % words.length;
          const selectedWord = words[normalizedSelectedWordIndex]?.trim();

          if (selectedWord) {
            void onSubmit(selectedWord);
          }
        }
        break;

      default:
        break;
    }
  });

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
        setSelectedWordIndex(0);
      }
    }
  };

  const handleRandomTopic = useCallback(() => {
    const randomTopic =
      UNIQUE_WORDS[Math.floor(Math.random() * UNIQUE_WORDS.length)];
    setInput(randomTopic ?? "mono");
    void onSubmit(randomTopic ?? "mono");
  }, [topic]);

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
      title=" TAB: focus · ARROWS/Vim: navigate · ENTER: submit · Shift+R: random "
      titleAlignment="right"
      justifyContent="center"
      alignItems="center"
      flexGrow={1}
    >
      <box flexDirection="column" gap={2} flexGrow={1}>
        <SearchBar
          searchFocused={focused === "input"}
          onSubmit={(submission) => {
            if (
              typeof submission === "string" &&
              submission.length > 0 &&
              focused === "input"
            ) {
              void onSubmit(submission);
              setFocused("article");
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
            focused={focused === "article"}
          />
        </box>
      </box>
    </box>
  );
}
