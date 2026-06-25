// ─────────────────────────────────────────────────────────────────────
//  THE API (backend) — Step 4
//
//  This is almost the same app as Step 3's counter, with ONE big change:
//  it no longer sends back HTML. It sends back JSON, because now a SEPARATE
//  frontend (Next.js) is in charge of showing things to the user.
//
//  Who talks to this service?  NOT the browser directly.
//  The Next.js SERVER calls us over Docker's private network as "api:4000".
// ─────────────────────────────────────────────────────────────────────

const express = require("express");
const { createClient } = require("redis");

const app = express();

// We run on 4000 (not 3000) so Next.js can own port 3000.
const PORT = process.env.PORT || 4000;

// Connect to Redis by its SERVICE NAME "redis" (from docker-compose.yml).
// Same idea as Step 3 — Docker's internal DNS turns "redis" into the right address.
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://redis:6379",
});

redisClient.on("error", (err) => console.log("Redis error:", err));

// GET /visits → increase the counter and return the new value as JSON.
app.get("/visits", async (req, res) => {
  const visits = await redisClient.incr("visits");
  res.json({ visits }); // e.g. { "visits": 7 }
});

// A simple health endpoint — handy for checking the service is alive.
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Connect to Redis FIRST, then start accepting requests.
async function start() {
  await redisClient.connect();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API running on http://0.0.0.0:${PORT}, talking to Redis`);
  });
}

start();
