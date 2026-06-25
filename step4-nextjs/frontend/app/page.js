// ─────────────────────────────────────────────────────────────────────
//  THE PAGE (runs in the BROWSER)
//
//  "use client" means this component runs in the user's browser.
//  IMPORTANT: the browser is NOT on Docker's network, so it CANNOT call
//  "http://api:4000". Instead it calls "/api/visits" — a same-origin URL
//  handled by OUR OWN Next.js server (see app/api/visits/route.js).
//  That server then forwards the request to the real API over Docker's
//  private network. This is the Backend-For-Frontend (BFF) pattern.
// ─────────────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";

export default function Home() {
  const [visits, setVisits] = useState(null);
  const [loading, setLoading] = useState(false);

  async function visit() {
    setLoading(true);
    // Same-origin call → no CORS needed. Hits OUR Next.js route handler.
    const res = await fetch("/api/visits");
    const data = await res.json();
    setVisits(data.visits);
    setLoading(false);
  }

  return (
    <main style={{ textAlign: "center", maxWidth: 560, padding: 24 }}>
      <h1 style={{ fontSize: 40, marginBottom: 8 }}>👋 Welcome</h1>
      <p style={{ color: "#94a3b8" }}>
        This page is served by <b>Next.js</b>. When you click the button, the
        Next.js <b>server</b> calls the <b>API</b> container, which asks{" "}
        <b>Redis</b> for the count — three containers, one click.
      </p>

      <button
        onClick={visit}
        disabled={loading}
        style={{
          marginTop: 24,
          fontSize: 18,
          padding: "12px 28px",
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          background: "#2563eb",
          color: "white",
          fontWeight: 600,
        }}
      >
        {loading ? "Counting…" : "Count my visit"}
      </button>

      {visits !== null && (
        <h2 style={{ marginTop: 28, fontSize: 28 }}>
          You are visitor #{visits} 🎉
        </h2>
      )}
    </main>
  );
}
