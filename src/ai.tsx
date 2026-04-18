import { generateText, streamText } from "ai";

const MODEL = "openai/gpt-oss-120b";

export async function sendTopicToAiWithStreaming(topic: string) {
  const result = streamText({
    model: MODEL,
    prompt: `What is a ${topic}?`,
  });
  return result.textStream;
}
