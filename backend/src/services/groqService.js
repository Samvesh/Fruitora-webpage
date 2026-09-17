import { env } from "../config/env.js";

const GROQ_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
const FALLBACK_MODEL = "qwen/qwen3.8-27b";
const REQUEST_TIMEOUT_MS = 15000;

// Remember verified active model to eliminate redundant 404 round-trips
let cachedWorkingModel = env.groqModel || FALLBACK_MODEL;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Call Groq API with streaming enabled
 * Highly optimized for low latency and zero redundant roundtrips
 *
 * @param {Array<{role: string, content: string}>} messages
 * @param {Object} options
 * @returns {AsyncGenerator<string>}
 */
export async function* streamGroqChat(messages, options = {}) {
  const apiKey =
    env.groqApiKey ||
    (process.env.GROQ_API_KEY ? String(process.env.GROQ_API_KEY).trim().replace(/^["']|["']$/g, "") : null);

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured in backend environment.");
  }

  const modelToUse = options.model || cachedWorkingModel;
  const maxTokens = options.maxTokens || 550; // Optimized for snappy response generation
  const temperature = options.temperature || 0.5;

  async function makeRequest(modelName) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(GROQ_COMPLETIONS_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: modelName,
          messages,
          stream: true,
          max_tokens: maxTokens,
          temperature
        })
      });

      clearTimeout(timeoutId);
      return res;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  let response;
  try {
    try {
      response = await makeRequest(modelToUse);
    } catch (firstErr) {
      // Fast single retry on transient socket glitch
      const isTransient =
        firstErr.name === "AbortError" ||
        firstErr.message?.includes("fetch failed") ||
        firstErr.code === "UND_ERR_CONNECT_TIMEOUT" ||
        firstErr.code === "ECONNRESET";

      if (isTransient) {
        await sleep(350);
        response = await makeRequest(modelToUse);
      } else {
        throw firstErr;
      }
    }

    // If model was 404, switch permanently to fallback and retry immediately
    if (response.status === 404 && modelToUse !== FALLBACK_MODEL) {
      console.warn(`[Groq Service] ${modelToUse} returned 404. Switching permanently to ${FALLBACK_MODEL}`);
      cachedWorkingModel = FALLBACK_MODEL;
      response = await makeRequest(FALLBACK_MODEL);
    }
  } catch (netErr) {
    console.error("[Groq Service Network Failure]", netErr.message);
    yield "I encountered a momentary network timeout reaching the AI server. ";
    yield "Please check your internet connection and tap Retry!";
    return;
  }

  if (!response.ok) {
    let errorDetails = "";
    try {
      const errJson = await response.json();
      errorDetails = errJson.error?.message || JSON.stringify(errJson);
    } catch {
      errorDetails = await response.text();
    }
    throw new Error(`Groq API error (${response.status}): ${errorDetails}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(":")) continue;

        if (trimmed === "data: [DONE]") {
          return;
        }

        if (trimmed.startsWith("data: ")) {
          try {
            const jsonStr = trimmed.slice(6);
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              yield delta;
            }
          } catch {
            // Ignore partial SSE JSON parse
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
