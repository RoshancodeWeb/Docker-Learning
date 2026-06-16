// A tiny web server — the "app" we're going to put inside a Docker container.
const express = require("express");
const app = express();

// The port our server listens on.
// We read it from an environment variable if present (Docker can set this),
// otherwise default to 3000. This is a good habit for containerized apps.
const PORT = process.env.PORT || 3000;

// One simple route: when someone visits "/", send back a friendly message.
app.get("/", (req, res) => {
  res.send(`
    <h1>🐳 Hello from inside a Docker container!</h1>
    <p>If you can read this in your browser, your image built and ran correctly.Making a little bit change</p>
    <p>This server is running on port ${PORT}.</p>
  `);
});

// A second route, handy for health checks later.
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start listening. "0.0.0.0" matters in Docker: it means
// "accept connections from outside the container", not just localhost.
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
