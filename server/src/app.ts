import express from "express";
import cors from "cors";
import { invokeGraph, invokeGraphStream } from "./services/graph.ai.service.js";

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

app.use(
  cors({
    origin: "https://ai-battle-arena-yfn4.vercel.app/",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});
let lastResult: any = null;

app.post("/invoke", async (req, res) => {
  try {
    const { input } = req.body;

    if (!input || typeof input !== "string" || !input.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid input string is required.",
      });
    }

    const result = await invokeGraph(input);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Invoke route failed:", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

app.post("/invoke/stream", async (req, res) => {
  const { input } = req.body;

  if (!input || typeof input !== "string" || !input.trim()) {
    return res.status(400).json({
      success: false,
      message: "A valid input string is required.",
    });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const sendEvent = (payload: unknown) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  try {
    for await (const event of invokeGraphStream(input)) {
      sendEvent(event);
    }
  } catch (error) {
    console.error("Invoke stream failed:", error);
    sendEvent({
      type: "error",
      message: error instanceof Error ? error.message : "Streaming failed.",
    });
  } finally {
    res.end();
  }
});
app.get("/use-graph", (req, res) => {
  res.json(lastResult);
});

// 404 handler
app.use((req, res) => {
  console.warn(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: ["GET /health", "POST /invoke", "POST /invoke/stream"],
  });
});

export default app;
