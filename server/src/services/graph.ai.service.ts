import { HumanMessage } from "@langchain/core/messages";
import { createAgent, providerStrategy } from "langchain";
import { z } from "zod";
import { CohereModel, OPENAIModel, MistralModel } from "./models.service.js";
import NodeCache from "node-cache";

const responseCache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // 5 min TTL

const API_TIMEOUT = 30000; // 30 seconds

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Request timed out after ${timeoutMs}ms`)),
        timeoutMs,
      ),
    ),
  ]);
}

const judgeSchema = z.object({
  solution_1_score: z.number().min(0).max(10),
  solution_2_score: z.number().min(0).max(10),
});

type SolutionKey = "solution_1" | "solution_2";

export type GraphResult = {
  solution_1: string;
  solution_2: string;
  judge_recommendation: {
    solution_1_score: number;
    solution_2_score: number;
  };
};

export type GraphStreamEvent =
  | {
      type: "phase";
      phase: "thinking" | "streaming" | "comparing" | "judge" | "completed";
    }
  | { type: "model_start"; key: SolutionKey }
  | { type: "model_token"; key: SolutionKey; token: string }
  | { type: "model_end"; key: SolutionKey; text: string }
  | { type: "model_error"; key: SolutionKey; message: string }
  | { type: "judge_result"; scores: GraphResult["judge_recommendation"] }
  | { type: "done"; data: GraphResult };

const defaultScores: GraphResult["judge_recommendation"] = {
  solution_1_score: 0,
  solution_2_score: 0,
};

function createAsyncEventQueue<T>() {
  const events: T[] = [];
  const waiters: Array<(value: T | null) => void> = [];
  let closed = false;

  return {
    push(event: T) {
      if (closed) {
        return;
      }

      const waiter = waiters.shift();
      if (waiter) {
        waiter(event);
        return;
      }

      events.push(event);
    },
    close() {
      closed = true;

      while (waiters.length > 0) {
        const waiter = waiters.shift();
        waiter?.(null);
      }
    },
    async *iterate() {
      while (!closed || events.length > 0) {
        if (events.length > 0) {
          yield events.shift() as T;
          continue;
        }

        const nextEvent = await new Promise<T | null>((resolve) => {
          waiters.push(resolve);
        });

        if (nextEvent === null) {
          break;
        }

        yield nextEvent;
      }
    },
  };
}

function toMessageText(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (
          part &&
          typeof part === "object" &&
          "text" in part &&
          typeof part.text === "string"
        ) {
          return part.text;
        }

        return "";
      })
      .join("");
  }

  return "";
}

async function streamSingleModel(
  key: SolutionKey,
  prompt: string,
  onEvent: (event: GraphStreamEvent) => void,
): Promise<string> {
  const model = key === "solution_1" ? MistralModel : CohereModel;
  const modelName = key === "solution_1" ? "Mistral" : "Cohere";
  let fullText = "";
  const startTime = Date.now();

  console.log(`📤 Calling ${modelName} model...`);
  onEvent({ type: "model_start", key });

  try {
    const streamPromise = model.stream(prompt);
    const stream = await withTimeout(streamPromise, API_TIMEOUT);
    console.log(`✓ ${modelName} stream started`);

    for await (const chunk of stream) {
      const token = chunk.text || toMessageText(chunk.content);

      if (!token) {
        continue;
      }

      fullText += token;
      onEvent({ type: "model_token", key, token });
    }

    if (!fullText.trim()) {
      throw new Error("No content was generated.");
    }

    const latency = Date.now() - startTime;
    console.log(
      `✓ ${modelName} completed in ${latency}ms, received ${fullText.length} characters`,
    );
    onEvent({ type: "model_end", key, text: fullText });
    return fullText;
  } catch (error) {
    const latency = Date.now() - startTime;
    const message =
      error instanceof Error ? error.message : "Streaming failed.";
    const fallback =
      "Model response is currently unavailable. Please try again later.";

    console.error(`❌ ${modelName} Model (${key}) failed after ${latency}ms:`);
    console.error("   Error:", error instanceof Error ? error.message : error);

    onEvent({ type: "model_error", key, message });
    onEvent({ type: "model_end", key, text: fallback });
    return fallback;
  }
}

async function judgeSolutions(
  prompt: string,
  solution_1: string,
  solution_2: string,
): Promise<GraphResult["judge_recommendation"]> {
  const startTime = Date.now();
  try {
    const judge = createAgent({
      model: OPENAIModel,
      tools: [],
      responseFormat: providerStrategy(judgeSchema),
    });

    const judgePromise = judge.invoke({
      messages: [
        new HumanMessage(
          `You are a judge tasked with evaluating two solutions to a problem. The problem is: ${prompt}.
Please provide a score between 0 and 10 for each solution, where 0 is the worst and 10 is the best.

Solution 1:
${solution_1}

Solution 2:
${solution_2}`,
        ),
      ],
    });

    const judgeResponse = await withTimeout(judgePromise, API_TIMEOUT);
    const latency = Date.now() - startTime;
    console.log(`✓ Judge completed in ${latency}ms`);
    return judgeResponse.structuredResponse ?? defaultScores;
  } catch (error) {
    const latency = Date.now() - startTime;
    console.error(`❌ Judge model failed after ${latency}ms:`, error);
    return defaultScores;
  }
}

export async function* invokeGraphStream(
  usermessage: string,
): AsyncGenerator<GraphStreamEvent, GraphResult, void> {
  const prompt = usermessage.trim();

  if (!prompt) {
    throw new Error("A user message is required.");
  }

  // Check cache first
  const cachedResult = responseCache.get<GraphResult>(prompt);
  if (cachedResult) {
    console.log("🚀 Returning cached result for prompt");
    yield { type: "phase", phase: "completed" };
    yield { type: "done", data: cachedResult };
    return cachedResult;
  }

  console.log(
    "🚀 Starting invokeGraphStream for prompt:",
    prompt.substring(0, 100),
  );

  const queue = createAsyncEventQueue<GraphStreamEvent>();

  yield { type: "phase", phase: "thinking" };
  console.log("✓ Yielded thinking phase");

  yield { type: "phase", phase: "streaming" };
  console.log("✓ Yielded streaming phase, starting model calls...");

  const solutionsPromise = Promise.all([
    streamSingleModel("solution_1", prompt, (event) => queue.push(event)),
    streamSingleModel("solution_2", prompt, (event) => queue.push(event)),
  ] as const).finally(() => {
    queue.close();
  });

  console.log("✓ Starting to iterate queue events...");
  for await (const event of queue.iterate()) {
    yield event;
  }
  console.log("✓ Queue iteration complete");

  const [solution_1, solution_2] = await solutionsPromise;
  console.log("✓ Awaited solutions");
  console.log("  - solution_1 length:", solution_1.length);
  console.log("  - solution_2 length:", solution_2.length);

  const FALLBACK_MESSAGE =
    "Model response is currently unavailable. Please try again later.";
  if (solution_1 === FALLBACK_MESSAGE && solution_2 === FALLBACK_MESSAGE) {
    throw new Error(
      "Both model invocations failed. Check your API keys and provider access.",
    );
  }

  yield { type: "phase", phase: "comparing" };
  yield { type: "phase", phase: "judge" };

  const judge_recommendation = await judgeSolutions(
    prompt,
    solution_1,
    solution_2,
  );
  yield { type: "judge_result", scores: judge_recommendation };

  const result: GraphResult = {
    solution_1,
    solution_2,
    judge_recommendation,
  };

  // Cache the result
  responseCache.set(prompt, result);

  yield { type: "phase", phase: "completed" };
  yield { type: "done", data: result };

  return result;
}

export const invokeGraph = async (
  usermessage: string,
): Promise<GraphResult> => {
  let finalResult: GraphResult | null = null;

  for await (const event of invokeGraphStream(usermessage)) {
    if (event.type === "done") {
      finalResult = event.data;
    }
  }

  if (!finalResult) {
    throw new Error("Failed to generate battle results.");
  }

  return finalResult;
};
