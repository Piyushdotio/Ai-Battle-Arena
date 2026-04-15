import { HumanMessage } from "@langchain/core/messages";
import { createAgent, providerStrategy } from "langchain";
import { z } from "zod";
import { CohereModel, geminiModel, MistralModel } from "./models.service.js";
import NodeCache from "node-cache";
const responseCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
const API_TIMEOUT = 30000;
function withTimeout(promise, timeoutMs) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)),
    ]);
}
const judgeSchema = z.object({
    solution_1_score: z.number().min(0).max(10),
    solution_2_score: z.number().min(0).max(10),
});
const defaultScores = {
    solution_1_score: 0,
    solution_2_score: 0,
};
function createAsyncEventQueue() {
    const events = [];
    const waiters = [];
    let closed = false;
    return {
        push(event) {
            if (closed)
                return;
            const waiter = waiters.shift();
            if (waiter) {
                waiter(event);
            }
            else {
                events.push(event);
            }
        },
        close() {
            closed = true;
            while (waiters.length) {
                waiters.shift()?.(null);
            }
        },
        async *iterate() {
            while (!closed || events.length > 0) {
                if (events.length > 0) {
                    yield events.shift();
                    continue;
                }
                const next = await new Promise((resolve) => waiters.push(resolve));
                if (next === null)
                    break;
                yield next;
            }
        },
    };
}
function toMessageText(content) {
    if (typeof content === "string")
        return content;
    if (Array.isArray(content)) {
        return content
            .map((part) => typeof part === "string"
            ? part
            : part?.text || "")
            .join("");
    }
    return "";
}
// ==============================
// 🔹 STREAM SINGLE MODEL
// ==============================
async function streamSingleModel(key, prompt, onEvent) {
    const model = key === "solution_1" ? MistralModel : CohereModel;
    const name = key === "solution_1" ? "Mistral" : "Cohere";
    let fullText = "";
    console.log(`📤 ${name} START`);
    onEvent({ type: "model_start", key });
    try {
        const stream = await withTimeout(model.stream(prompt), API_TIMEOUT);
        for await (const chunk of stream) {
            const token = chunk.text || toMessageText(chunk.content);
            if (!token)
                continue;
            fullText += token;
            onEvent({ type: "model_token", key, token });
        }
        if (!fullText.trim()) {
            throw new Error("Empty response");
        }
        console.log(`✅ ${name} DONE`);
        onEvent({ type: "model_end", key, text: fullText });
        return fullText;
    }
    catch (err) {
        console.error(`❌ ${name} FAILED`, err);
        const fallback = "Model response is currently unavailable. Please try again later.";
        onEvent({ type: "model_error", key, message: err instanceof Error ? err.message : String(err) });
        onEvent({ type: "model_end", key, text: fallback });
        return fallback;
    }
}
// ==============================
// 🔥 JUDGE FIXED
// ==============================
async function judgeSolutions(prompt, s1, s2) {
    console.log("🧠 JUDGE START");
    try {
        const judge = createAgent({
            model: geminiModel,
            tools: [],
            responseFormat: providerStrategy(judgeSchema),
        });
        const res = await withTimeout(judge.invoke({
            messages: [
                new HumanMessage(`
Evaluate both solutions.

Problem:
${prompt}

Solution 1:
${s1}

Solution 2:
${s2}

Return JSON ONLY:
{
  "solution_1_score": number,
  "solution_2_score": number
}
          `),
            ],
        }), API_TIMEOUT);
        console.log("🧠 JUDGE RAW:", res);
        // ✅ structured (best case)
        if (res?.structuredResponse) {
            return res.structuredResponse;
        }
        // 🔥 fallback parse
        try {
            const text = res?.content?.[0]?.text ||
                res?.output_text ||
                "";
            const parsed = JSON.parse(text);
            return parsed;
        }
        catch (e) {
            console.error("❌ Judge parse failed", e);
            return defaultScores;
        }
    }
    catch (err) {
        console.error("❌ Judge failed", err);
        return defaultScores;
    }
}
// ==============================
// 🚀 MAIN STREAM
// ==============================
export async function* invokeGraphStream(input) {
    const prompt = input.trim();
    if (!prompt)
        throw new Error("Input required");
    const cached = responseCache.get(prompt);
    if (cached) {
        yield { type: "phase", phase: "completed" };
        yield { type: "done", data: cached };
        return cached;
    }
    const queue = createAsyncEventQueue();
    yield { type: "phase", phase: "thinking" };
    yield { type: "phase", phase: "streaming" };
    const solutionsPromise = Promise.all([
        streamSingleModel("solution_1", prompt, (e) => queue.push(e)),
        streamSingleModel("solution_2", prompt, (e) => queue.push(e)),
    ]).finally(() => queue.close());
    for await (const event of queue.iterate()) {
        console.log("🔥 EVENT:", event?.type);
        yield event;
    }
    const [s1, s2] = await solutionsPromise;
    yield { type: "phase", phase: "comparing" };
    yield { type: "phase", phase: "judge" };
    const scores = await judgeSolutions(prompt, s1, s2);
    yield { type: "judge_result", scores };
    const result = {
        solution_1: s1,
        solution_2: s2,
        judge_recommendation: scores,
    };
    responseCache.set(prompt, result);
    yield { type: "phase", phase: "completed" };
    yield { type: "done", data: result };
    return result;
}
// ==============================
// 🔹 NON-STREAM
// ==============================
export const invokeGraph = async (input) => {
    let final = null;
    for await (const event of invokeGraphStream(input)) {
        if (event?.type === "done") {
            final = event.data;
        }
    }
    if (!final)
        throw new Error("No result");
    return final;
};
//# sourceMappingURL=graph.ai.service.js.map