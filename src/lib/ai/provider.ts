// src/lib/ai/provider.ts
// LINKER - AI Provider with Groq (primary) + OpenRouter (fallback)

import Groq from 'groq-sdk';

export type AIProvider = 'groq' | 'openrouter';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionOptions {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  runType?: string;
  userId?: string;
}

export interface AICompletionResult {
  content: string;
  provider: AIProvider;
  model: string;
  promptTokens?: number;
  responseTokens?: number;
  durationMs?: number;
  fallbackUsed: boolean;
}

const GROQ_MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? 'anthropic/claude-3.5-sonnet';

// ── Groq client (lazy init) ──────────────────────────────────
function getGroqClient(): Groq | null {
  if (!process.env.GROQ_API_KEY) return null;
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// ── OpenRouter (OpenAI-compatible) ───────────────────────────
async function callOpenRouter(
  messages: AIMessage[],
  temperature = 0.7,
  maxTokens = 1500,
): Promise<{ content: string; promptTokens?: number; responseTokens?: number }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured');

  const baseUrl = process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1';

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      'X-Title': 'Linker',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  if (!choice?.message?.content) {
    throw new Error('OpenRouter returned no content');
  }

  return {
    content: choice.message.content as string,
    promptTokens: data.usage?.prompt_tokens,
    responseTokens: data.usage?.completion_tokens,
  };
}

// ── Primary: Groq ────────────────────────────────────────────
async function callGroq(
  messages: AIMessage[],
  temperature = 0.7,
  maxTokens = 1500,
): Promise<{ content: string; promptTokens?: number; responseTokens?: number }> {
  const groq = getGroqClient();
  if (!groq) throw new Error('GROQ_API_KEY is not configured');

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: messages as Groq.Chat.ChatCompletionMessageParam[],
    temperature,
    max_tokens: maxTokens,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('Groq returned no content');

  return {
    content,
    promptTokens: completion.usage?.prompt_tokens,
    responseTokens: completion.usage?.completion_tokens,
  };
}

// ── Public: complete() with automatic fallback ───────────────
export async function complete(
  options: AICompletionOptions,
): Promise<AICompletionResult> {
  const { messages, temperature = 0.7, maxTokens = 1500 } = options;

  const start = Date.now();

  // Try Groq first
  if (process.env.GROQ_API_KEY) {
    try {
      const result = await callGroq(messages, temperature, maxTokens);
      return {
        content: result.content,
        provider: 'groq',
        model: GROQ_MODEL,
        promptTokens: result.promptTokens,
        responseTokens: result.responseTokens,
        durationMs: Date.now() - start,
        fallbackUsed: false,
      };
    } catch (groqError) {
      console.warn('[AI] Groq failed, trying OpenRouter fallback:', groqError);
    }
  }

  // Fallback to OpenRouter
  if (process.env.OPENROUTER_API_KEY) {
    const result = await callOpenRouter(messages, temperature, maxTokens);
    return {
      content: result.content,
      provider: 'openrouter',
      model: OPENROUTER_MODEL,
      promptTokens: result.promptTokens,
      responseTokens: result.responseTokens,
      durationMs: Date.now() - start,
      fallbackUsed: !process.env.GROQ_API_KEY, // fallback only if Groq was tried and failed
    };
  }

  throw new Error(
    'No AI provider is configured. Set GROQ_API_KEY or OPENROUTER_API_KEY in your environment.',
  );
}

// ── Check if any AI provider is available ───────────────────
export function isAIConfigured(): boolean {
  return !!(process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY);
}

export function getConfiguredProviders(): AIProvider[] {
  const providers: AIProvider[] = [];
  if (process.env.GROQ_API_KEY) providers.push('groq');
  if (process.env.OPENROUTER_API_KEY) providers.push('openrouter');
  return providers;
}
