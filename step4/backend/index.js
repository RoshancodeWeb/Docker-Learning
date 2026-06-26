// ─────────────────────────────────────────────────────────────────────
//  THE API (backend) — Step 4
//
//  Sends back JSON only. A separate Next.js frontend shows things to users.
//  Who calls us? NOT the browser — the Next.js SERVER reaches us over
//  Docker's private network as "backend:4000".
// ─────────────────────────────────────────────────────────────────────

const express = require("express");
const { createClient } = require("redis");

const app = express();

// Parse JSON request bodies (needed for POST /reactions).
app.use(express.json());

// We run on 4000 (not 3000) so Next.js can own port 3000.
const PORT = process.env.PORT || 4000;

// Connect to Redis by its SERVICE NAME "redis" (from docker-compose.yml).
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://redis:6379",
});

redisClient.on("error", (err) => console.log("Redis error:", err));

// ── EMOJI REACTION BOARD ────────────────────────────────────────────
// All counts live in ONE Redis HASH called "reactions", like:
//   reactions = { fire: 12, love: 30, wow: 4, nice: 18 }
// A hash is perfect here: one key holds many named counters.
//
// We only accept these keys (a tiny allow-list = basic input validation).
const ALLOWED = ["fire", "love", "wow", "nice"];

// GET /reactions → return the current count of every emoji as JSON.
app.get("/reactions", async (req, res) => {
  // hGetAll returns strings (or missing keys), e.g. { fire: "12" }.
  const raw = await redisClient.hGetAll("reactions");

  // Normalise: make sure every allowed key exists and is a number.
  const counts = {};
  for (const key of ALLOWED) counts[key] = Number(raw[key] || 0);

  res.json(counts); // { fire: 12, love: 30, wow: 4, nice: 18 }
});

// POST /reactions  body: { "emoji": "fire" } → +1 to that emoji, return new count.
app.post("/reactions", async (req, res) => {
  const { emoji } = req.body || {};

  // Reject anything not in our allow-list.
  if (!ALLOWED.includes(emoji)) {
    return res.status(400).json({ error: "unknown reaction" });
  }

  // hIncrBy atomically adds 1 to that field and returns the NEW value.
  // "Atomically" = safe even if many people click at the exact same time.
  const count = await redisClient.hIncrBy("reactions", emoji, 1);

  res.json({ emoji, count });
});

// ── Old Step-4 endpoints (kept so nothing breaks) ───────────────────
app.get("/visits", async (req, res) => {
  const visits = await redisClient.incr("visits");
  res.json({ visits });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

// Connect to Redis FIRST, then start accepting requests.
async function start() {
  await redisClient.connect();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API running on http://0.0.0.0:${PORT}, talking to Redis`);
  });
}

start();
