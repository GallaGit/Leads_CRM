import Groq from "groq-sdk";
import type {
  ChatCompletionCreateParamsBase,
  ChatCompletionMessageParam,
} from "groq-sdk/resources/chat/completions";

type ReasoningEffort = "low" | "medium" | "high";

export type GroqCompletionOptions = Partial<
  Pick<
    ChatCompletionCreateParamsBase,
    "max_completion_tokens" | "reasoning_effort" | "stop" | "temperature" | "top_p"
  >
>;

let client: Groq | null = null;

function envNumber(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

function reasoningEffort(): ReasoningEffort {
  const value = process.env.GROQ_REASONING_EFFORT;
  return value === "low" || value === "high" ? value : "medium";
}

function completionDefaults() {
  return {
    model: process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-120b",
    temperature: envNumber("GROQ_TEMPERATURE", 1),
    max_completion_tokens: envNumber("GROQ_MAX_COMPLETION_TOKENS", 2048),
    top_p: envNumber("GROQ_TOP_P", 1),
    reasoning_effort: reasoningEffort(),
    stop: null,
  } satisfies GroqCompletionOptions & { model: string };
}

export function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY no configurado");
  }
  client ??= new Groq({ apiKey });
  return client;
}

export function createGroqCompletion(
  messages: ChatCompletionMessageParam[],
  options: GroqCompletionOptions = {},
) {
  return getGroqClient().chat.completions.create({
    ...completionDefaults(),
    ...options,
    messages,
    stream: false,
  });
}

export function createGroqStream(
  messages: ChatCompletionMessageParam[],
  options: GroqCompletionOptions = {},
) {
  return getGroqClient().chat.completions.create({
    ...completionDefaults(),
    ...options,
    messages,
    stream: true,
  });
}
