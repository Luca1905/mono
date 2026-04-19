import type { GoogleLanguageModelOptions } from "@ai-sdk/google";
import { createGateway, streamText } from "ai";

const gateway = createGateway({ apiKey: process.env.AI_GATEWAY_API_KEY });

// export const MODEL = "openai/gpt-oss-120b";
export const MODEL = gateway("google/gemini-2.5-flash-lite");

export async function streamArticleForTopic(topic: string) {
  const prompt = `Write a concise, neutral, encyclopedia-style definition of "${topic}" in a single plain-text paragraph. Start by clearly stating what the topic is, then briefly describe its key characteristics, context, or significance. Make the definition self-contained and understandable without additional context. Avoid filler, speculation, and unsupported claims. Do not use markdown, headings, lists, or special formatting. Respond with only the definition text.`;
  console.log("Made Article Request for topic:", topic);
  const result = streamText({
    model: MODEL,
    prompt,
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: 0,
          includeThoughts: false,
        },
      } satisfies GoogleLanguageModelOptions,
    },
  });
  return result.textStream;
}

export async function streamAsciiArtForTopic(topic: string) {
  console.log("Made ASCII Art Request for topic:", topic);

  const systemPrompt = `You are an ASCII artist. Your only task is to create original, expressive 
ASCII art for the topic provided by the user.

Output rules — follow these exactly:
- Output ONLY the raw art: plain characters and newlines. Nothing else.
- No titles, explanations, preamble, code fences, or any surrounding text.
- No ANSI color or escape codes.
- Do not embed words, letters, or the topic name into the artwork.

Character palette:
Use any Unicode characters available in a terminal — standard ASCII,
box-drawing (─ │ ╭ ╰ ┤), block elements (█ ▓ ▒ ░), Braille patterns (⣿ ⠿),
geometric shapes, and anything else a terminal can render.

Canvas:
Choose the size and shape that best serves the composition. A wide panorama,
a tall narrow form, a tiny intimate sketch — let the idea decide.
Hard limits: no more than 20 characters wide and no more than 10 rows tall.
There is no minimum — a small composition is perfectly valid.

Style:
- Interpret the topic as an artist, not an encyclopedia. Make it personal.
- Abstract or emotional topics should be expressed through visual metaphor
  or symbol — find the feeling, not the definition.
- Use negative space deliberately. Keep the composition balanced and
  intentional. Avoid random noise or filler characters.

Edge cases:
- If the input is nonsensical, unrecognizable, or inappropriate, output a
  silent visual composition built around a question mark motif. No text.
  No explanation. Just the art.`;

  const prompt = `Topic: ${topic}`;
  const result = streamText({
    model: MODEL,
    system: systemPrompt,
    prompt,
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: 4096 * 2,
          includeThoughts: false,
        },
      } satisfies GoogleLanguageModelOptions,
    },
  });
  return result.textStream;
}
