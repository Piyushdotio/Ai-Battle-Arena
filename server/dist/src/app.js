import express from "express";
import cors from "cors";
import { invokeGraph, invokeGraphStream } from "./services/graph.ai.service.js";
const app = express();
// 🔍 Request logging
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
});
// 🌐 CORS (local dev)
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.use(express.json());
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
    }
    catch (error) {
        console.error("❌ Invoke route failed:", error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error",
        });
    }
});
// ==============================
// 🔥 STREAMING API (SSE FIXED)
// ==============================
app.post("/invoke/stream", async (req, res) => {
    const { input } = req.body;
    if (!input || typeof input !== "string" || !input.trim()) {
        return res.status(400).json({
            success: false,
            message: "A valid input string is required.",
        });
    }
    console.log("🚀 STREAM START");
    // ✅ SSE HEADERS (CRITICAL)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // 🔥 prevents buffering
    res.flushHeaders?.();
    // ✅ Send helper
    const sendEvent = (payload) => {
        const data = `data: ${JSON.stringify(payload)}\n\n`;
        res.write(data);
        // 🔍 Debug
        if (typeof payload === "object" && payload !== null && "type" in payload) {
            console.log("📡 EVENT:", payload.type);
        }
    };
    try {
        for await (const event of invokeGraphStream(input)) {
            sendEvent(event);
        }
        console.log("✅ STREAM COMPLETE");
    }
    catch (error) {
        console.error("❌ STREAM ERROR:", error);
        sendEvent({
            type: "error",
            message: error instanceof Error ? error.message : "Streaming failed.",
        });
    }
    finally {
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
        availableRoutes: ["GET /health", "POST /invoke", "POST /invoke/stream"],
    });
});
export default app;
//# sourceMappingURL=app.js.map