import Groq from "groq-sdk";
import type {
  ChatCompletionCreateParamsBase,
  ChatCompletionMessageParam,
} from "groq-sdk/resources/chat/completions";
import { getSettingsService } from "@/lib/settings/service";

type ReasoningEffort = "low" | "medium" | "high";

export type GroqCompletionOptions = Partial<
  Pick<
    ChatCompletionCreateParamsBase,
    "max_completion_tokens" | "reasoning_effort" | "stop" | "temperature" | "top_p"
  >
>;

let client: Groq | null = null;
let cachedKey: string | null = null;

function envNumber(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

function reasoningEffort(): ReasoningEffort {
  const value = process.env.GROQ_REASONING_EFFORT;
  return value === "low" || value === "high" ? value : "medium";
}

function groqApiKey(): string {
  return getSettingsService().getRaw().ai.apiKey.value;
}

function completionDefaults() {
  const model =
    getSettingsService().getRaw().ai.model.value || "openai/gpt-oss-120b";
  return {
    model,
    temperature: envNumber("GROQ_TEMPERATURE", 1),
    max_completion_tokens: envNumber("GROQ_MAX_COMPLETION_TOKENS", 2048),
    top_p: envNumber("GROQ_TOP_P", 1),
    reasoning_effort: reasoningEffort(),
    stop: null,
  } satisfies GroqCompletionOptions & { model: string };
}

export function getGroqClient(): Groq {
  const apiKey = groqApiKey();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY no configurado");
  }
  if (!client || cachedKey !== apiKey) {
    client = new Groq({ apiKey });
    cachedKey = apiKey;
  }
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
