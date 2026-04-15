import express from "express";
import cors from "cors";
import { invokeGraph, invokeGraphStream } from "./services/graph.ai.service.js";

const app = express();

// 🔍 Request logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// 🌐 Ultimate CORS & OPTIONS Handling
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Expose-Headers", "Content-Type, X-Accel-Buffering"); // Fundamental for Streaming

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  next();
});

app.use(express.json());

// 🏠 Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to LANGRAPH Server API",
    version: "1.0.0"
  });
});

// ✅ Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

// ==============================
// 🔹 NORMAL API (non-stream)
// ==============================
app.post("/invoke", async (req, res) => {
  try {
    const { input } = req.body;

    if (!input || typeof input !== "string" || !input.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid input string is required.",
      });
    }

    console.log("🚀 /invoke called");

    const result = await invokeGraph(input);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Invoke route failed:", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

// ✅ SSE HEADERS (CRITICAL ORDER FOR VERCEL)
app.post("/invoke/stream", async (req, res) => {
  const { input } = req.body;

  if (!input || typeof input !== "string" || !input.trim()) {
    return res.status(400).json({ success: false, message: "A valid input string is required." });
  }

  // 🔥 VERCEL SSE FIX: Set headers BEFORE anything else
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no", // 🔥 Stops Vercel/Nginx from buffering the stream
    "Access-Control-Allow-Origin": req.headers.origin || "*",
    "Access-Control-Allow-Credentials": "true",
  });

  const sendEvent = (payload: unknown) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  try {
    for await (const event of invokeGraphStream(input)) {
      sendEvent(event);
    }
  } catch (error) {
    console.error("❌ STREAM ERROR:", error);
    sendEvent({ type: "error", message: error instanceof Error ? error.message : "Streaming failed." });
  } finally {
    res.end();
  }
});

// ==============================
// ❌ 404 HANDLER
// ==============================
app.use((req, res) => {
  console.warn(`❌ 404 - Route not found: ${req.method} ${req.path}`);

  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: ["GET /", "GET /health", "POST /invoke", "POST /invoke/stream"],
  });
});

export default app;