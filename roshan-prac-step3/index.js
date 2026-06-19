// A tiny web app that counts visits — and stores the count in Redis,
// a SEPARATE container. This is the whole point of Step 3: two services talking.

const express = require("express");
const { createClient } = require("redis");

const app = express();
const PORT = process.env.PORT || 3000;

// ── The most important line in this whole step ──────────────────────────
// We connect to Redis using the hostname "redis" — which is NOT an IP address.
// It's the NAME of the Redis service in docker-compose.yml. Docker's internal
// network turns that name into the right address automatically.
//
// We read it from an environment variable (set in docker-compose.yml) so the
// address isn't hard-coded — good practice.
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://redis:6379",
});

redisClient.on("error", (err) => console.log("Redis error:", err));

app.get("/", async (req, res) => {
  // Ask Redis to increase the "visits" counter by 1 and give us the new value.
  // The count survives even if THIS app restarts, because Redis stores it.
  const visits = await redisClient.incr("visits");

  res.send(`
    <h1>👋 Hello! You are visitor #${visits}</h1>
    <p>This number is stored in <b>Redis</b> — a different container.</p>
    <p>Refresh the page and watch it go up. Restart my app and it still remembers,
       because Redis is holding the count, not me.</p>
  `);
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

// Connect to Redis first, THEN start accepting web requests.
async function start() {
  await redisClient.connect();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}, talking to Redis`);
  });
}

start();
