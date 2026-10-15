import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import fs from "fs";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { handleStreamingChat } from "../streamingChat";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getProviderCandidates, invokeLLM } from "./llm";

// Global process error barriers to prevent container crashes on async rejections
process.on("unhandledRejection", (reason) => {
  console.error("[Process Barrier] Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[Process Barrier] Uncaught Exception:", err);
});

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Security headers middleware
  app.use((req, res, next) => {
    // Strict Transport Security - force HTTPS
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Permissions Policy
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
    // Content Security Policy - allowing necessary resources
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: blob: https:; " +
      "connect-src 'self' https://api.openai.com wss: https:; " +
      "frame-ancestors 'self';"
    );
    next();
  });
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Health check endpoints for Railway and Docker
  app.get("/health", (_req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "ruzn-backend",
      version: "1.0.0",
    });
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "ruzn-backend",
      version: "1.0.0",
    });
  });

  // Diagnostic Endpoint — Inspects container runtime, database presence, and active AI engine
  app.get("/api/debug/system", (_req, res) => {
    let sqliteStatus = 'untested';
    let sqliteError: string | null = null;
    let sqliteRows = 0;
    try {
      const dbPath = path.join(process.cwd(), 'knowledge', 'corpus', 'SOVEREIGN_LEGAL_VECTOR_INDEX.sqlite');
      const exists = fs.existsSync(dbPath);
      sqliteStatus = exists ? `exists (${fs.statSync(dbPath).size} bytes)` : 'NOT_FOUND';
      if (exists) {
        try {
          const Database = require('better-sqlite3');
          const db = new Database(dbPath, { readonly: true });
          const stmt = db.prepare('SELECT count(*) as c FROM legal_articles');
          const row = stmt.get() as any;
          sqliteRows = row?.c || 0;
          sqliteStatus += ` - articles: ${sqliteRows}`;
          db.close();
        } catch (sqliteLoadErr: any) {
          sqliteError = 'load/query error: ' + sqliteLoadErr.message;
        }
      }
    } catch (e: any) {
      sqliteError = e.message;
    }

    let llmCandidates: any[] = [];
    try {
      llmCandidates = getProviderCandidates().map(c => ({
        name: c.name,
        model: c.model,
        url: c.url,
        keyPrefix: c.apiKey ? (c.apiKey.substring(0, 6) + '...') : 'NONE'
      }));
    } catch (e: any) {
      // ignore
    }

    res.json({
      status: "ok",
      time: new Date().toISOString(),
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        HAS_GEMINI_KEY: !!process.env.GEMINI_API_KEY,
        HAS_DEEPSEEK_KEY: !!process.env.DEEPSEEK_API_KEY,
        HAS_PERPLEXITY_KEY: !!process.env.PERPLEXITY_API_KEY,
        HAS_DB_URL: !!process.env.DATABASE_URL
      },
      sqlite: {
        status: sqliteStatus,
        error: sqliteError
      },
      llm: llmCandidates
    });
  });

  // Direct sync test AI endpoint
  app.post("/api/debug/test-ai", async (req, res) => {
    try {
      const { message = 'مرحبا' } = req.body || {};
      const resp = await invokeLLM({
        messages: [{ role: 'user', content: message }]
      });
      res.json({ ok: true, answer: resp.choices[0]?.message?.content });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message, stack: err.stack });
    }
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Streaming chat endpoint (SSE)
  app.post("/api/chat/stream", handleStreamingChat);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "3000");

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

startServer().catch(console.error);
