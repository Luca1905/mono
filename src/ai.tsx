import { generateText, streamText } from "ai";

const MODEL = "openai/gpt-oss-120b";

export async function sendTopicToAiWithStreaming(topic: string) {
export async function streamArticleForTopic(topic: string) {
  const prompt = `Write a concise, neutral, encyclopedia-style definition of "${topic}" in a single plain-text paragraph. Start by clearly stating what the topic is, then briefly describe its key characteristics, context, or significance. Make the definition self-contained and understandable without additional context. Avoid filler, speculation, and unsupported claims. Do not use markdown, headings, lists, or special formatting. Respond with only the definition text.`;
  const result = streamText({
    model: MODEL,
    prompt,
  });
  return result.textStream;
}
