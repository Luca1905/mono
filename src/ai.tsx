import type { GoogleLanguageModelOptions } from "@ai-sdk/google";
import { createGateway, streamText } from "ai";

const gateway = createGateway({ apiKey: process.env.AI_GATEWAY_API_KEY });

// export const MODEL = "openai/gpt-oss-120b";
export const MODEL = gateway("google/gemini-2.5-flash-lite");

export async function streamArticleForTopic(topic: string) {
  const prompt = `Write a concise, neutral, encyclopedia-style definition of "${topic}" in a single plain-text paragraph. Start by clearly stating what the topic is, then briefly describe its key characteristics, context, or significance. Make the definition self-contained and understandable without additional context. Avoid filler, speculation, and unsupported claims. Do not use markdown, headings, lists, or special formatting. Respond with only the definition text.`;
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
