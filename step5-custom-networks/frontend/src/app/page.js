// ─────────────────────────────────────────────────────────────────────
//  EMOJI REACTION BOARD (runs in the BROWSER — "use client")
//
//  Flow on every click:
//    browser → /api/reactions (Next server) → backend:4000 → Redis
//
//  The browser NEVER touches the backend directly. It calls our own
//  same-origin route handler, which bridges to the backend over Docker.
// ─────────────────────────────────────────────────────────────────────
"use client";

import { useEffect, useState } from "react";

// The reactions we support. "key" matches the backend's allow-list.
const REACTIONS = [
  { key: "fire", emoji: "🔥", label: "Fire", color: "#fb923c" },
  { key: "love", emoji: "❤️", label: "Love", color: "#f43f5e" },
  { key: "wow", emoji: "😮", label: "Wow", color: "#facc15" },
  { key: "nice", emoji: "👍", label: "Nice", color: "#38bdf8" },
];

export default function Home() {
  const [counts, setCounts] = useState(null); // null = still loading
  const [popKey, setPopKey] = useState(null); // which emoji is animating

  // Load all counts from the server.
  async function load() {
    const res = await fetch("/api/reactions");
    const data = await res.json();
    setCounts(data);
  }

  // On mount: load once, then poll every 4s so it feels "live"
  // (open two browser tabs and watch them update each other).
  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  // Click a reaction: optimistic +1, send to server, trigger the pop.
  async function react(key) {
    setPopKey(key);
    setTimeout(() => setPopKey(null), 350);

    // Optimistic update — bump the number instantly for a snappy feel.
    setCounts((c) => ({ ...c, [key]: (c?.[key] ?? 0) + 1 }));

    // Tell the server (which tells the backend, which tells Redis).
    const res = await fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji: key }),
    });
    const data = await res.json(); // { emoji, count }

    // Sync to the real value from Redis (in case other people clicked too).
    setCounts((c) => ({ ...c, [data.emoji]: data.count }));
  }

  const total = counts
    ? Object.values(counts).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div style={styles.page}>
      {/* Keyframes for the click "pop" and the soft background drift */}
      <style>{`
        @keyframes pop { 0%{transform:scale(1)} 40%{transform:scale(1.35)} 100%{transform:scale(1)} }
        @keyframes floaty { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={styles.card}>
        <div style={styles.badge}>● live · stored in Redis</div>
        <h1 style={styles.title}>How do you feel?</h1>
        <p style={styles.subtitle}>
          Tap a reaction. It travels{" "}
          <b style={{ color: "#fff" }}>browser → Next.js → API → Redis</b> —
          three containers, one click.
        </p>

        <div style={styles.grid}>
          {REACTIONS.map((r, i) => {
            const value = counts?.[r.key] ?? 0;
            const isPopping = popKey === r.key;
            return (
              <button
                key={r.key}
                onClick={() => react(r.key)}
                disabled={counts === null}
                style={{
                  ...styles.button,
                  borderColor: isPopping ? r.color : "rgba(255,255,255,0.12)",
                  boxShadow: isPopping
                    ? `0 0 0 3px ${r.color}55, 0 12px 30px ${r.color}33`
                    : "0 8px 24px rgba(0,0,0,0.25)",
                  animation: `fadeUp 0.5s ease ${i * 0.08}s both`,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-4px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <span
                  style={{
                    ...styles.emoji,
                    animation: isPopping
                      ? "pop 0.35s ease"
                      : "floaty 3s ease-in-out infinite",
                    animationDelay: isPopping ? "0s" : `${i * 0.2}s`,
                  }}
                >
                  {r.emoji}
                </span>
                <span style={{ ...styles.count, color: r.color }}>
                  {counts === null ? "—" : value}
                </span>
                <span style={styles.label}>{r.label}</span>
              </button>
            );
          })}
        </div>

        <div style={styles.total}>
          {counts === null ? "Loading…" : (
            <>
              <b style={{ color: "#fff" }}>{total}</b> total reactions · they
              survive restarts (try{" "}
              <code style={styles.code}>docker compose restart frontend</code>)
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline styles keep this self-contained and avoid Tailwind v4 class quirks.
const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    background:
      "radial-gradient(1200px 600px at 20% 0%, #312e81 0%, transparent 50%), radial-gradient(1000px 500px at 100% 100%, #6d28d9 0%, transparent 45%), #0b1020",
  },
  card: {
    width: "100%",
    maxWidth: 620,
    padding: "40px 32px",
    borderRadius: 24,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
    textAlign: "center",
    animation: "fadeUp 0.6s ease both",
  },
  badge: {
    display: "inline-block",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.5,
    color: "#a7f3d0",
    background: "rgba(16,185,129,0.12)",
    border: "1px solid rgba(16,185,129,0.3)",
    padding: "4px 12px",
    borderRadius: 999,
    marginBottom: 18,
  },
  title: {
    fontSize: 38,
    fontWeight: 800,
    margin: "0 0 10px",
    color: "#f8fafc",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 1.6,
    color: "#94a3b8",
    margin: "0 auto 30px",
    maxWidth: 440,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 14,
  },
  button: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "22px 8px 16px",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    cursor: "pointer",
    transition: "transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease",
    color: "#e2e8f0",
  },
  emoji: { fontSize: 40, lineHeight: 1, display: "inline-block" },
  count: { fontSize: 26, fontWeight: 800, fontVariantNumeric: "tabular-nums" },
  label: { fontSize: 13, color: "#94a3b8", fontWeight: 600 },
  total: {
    marginTop: 28,
    fontSize: 14,
    color: "#94a3b8",
  },
  code: {
    background: "rgba(255,255,255,0.08)",
    padding: "2px 7px",
    borderRadius: 6,
    fontSize: 12.5,
    color: "#cbd5e1",
  },
};
