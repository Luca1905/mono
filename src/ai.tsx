import type { GoogleLanguageModelOptions } from "@ai-sdk/google";
import { createGateway, generateText, streamText } from "ai";
import z from "zod";

const gateway = createGateway({ apiKey: process.env.AI_GATEWAY_API_KEY });

// export const MODEL = "openai/gpt-oss-120b";
export const MODEL = gateway("google/gemini-2.5-flash-lite");

export async function* streamArticleForTopic(topic: string) {
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
  for await (const delta of result.textStream) {
    yield delta;
  }
}

export async function streamAsciiArtForTopic(topic: string) {
  console.log("Made ASCII Art Request for topic:", topic);

  const artPromptPart = `1. "art": meta ASCII visualization of the word "${topic}":
  - Palette: │─┌┐└┘├┤┬┴┼►◄▲▼○●◐◑░▒▓█▀▄■□▪▫★☆♦♠♣♥⟨⟩/\\_|
  - Shape mirrors concept - make the visual form embody the word's essence
  - Examples: 
    * "explosion" → radiating lines from center
    * "hierarchy" → pyramid structure
    * "flow" → curved directional lines
  - Return as single string with \n for line breaks`;

  const keysDescription = `one key: "art"`;
  const promptBody = artPromptPart;

  const prompt = `For "${topic}", create a JSON object with ${keysDescription}.
  ${promptBody}
Return ONLY the raw JSON object, no additional text. The response must start with "{" and end with "}" and contain only the art property.`;

  const result = await generateText({
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
  console.log("Finished ASCII Art Stream: \n", result.text);

  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
  const match = result.text.match(fenceRegex);
  if (!match?.[1]) {
    throw new Error(
      `Failed to extract ASCII art from response: ${result.text}`,
    );
  }
  const strippedData = match[1].trim();

  console.log("Stripped Data:", strippedData);

  const jsonData = z
    .object({ art: z.string() })
    .safeParse(JSON.parse(strippedData));
  if (!jsonData.success) {
    throw new Error(
      `Failed to parse JSON object from response: ${result.text}`,
    );
  }

  return jsonData.data.art;
}
