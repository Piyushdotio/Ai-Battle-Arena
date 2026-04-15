import app from "./src/app.js";

const PORT = 3000;

const server = app.listen(PORT, () => {
  console.log(`✓ Server is running on http://localhost:${PORT}`);
  console.log(`✓ Endpoints available:`);
  console.log(`  - GET  /health`);
  console.log(`  - POST /invoke`);
  console.log(`  - POST /invoke/stream`);
});

server.on("error", (error) => {
  console.error("❌ Server error:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});
