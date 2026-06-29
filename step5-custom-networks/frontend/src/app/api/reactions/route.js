// ─────────────────────────────────────────────────────────────────────
//  ROUTE HANDLER (runs on the Next.js SERVER, inside the container)
//
//  This is the BRIDGE. The browser calls "/api/reactions" (same-origin,
//  no CORS). This code runs on the server — which IS on Docker's private
//  network — so it can reach the backend by its service name "backend".
//
//  API_URL comes from docker-compose (.env) = http://backend:4000
// ─────────────────────────────────────────────────────────────────────

const apiUrl = process.env.API_URL || "http://backend:4000";

// GET /api/reactions → fetch all current counts from the backend.
export async function GET() {
  const res = await fetch(`${apiUrl}/reactions`, { cache: "no-store" });
  const data = await res.json();
  return Response.json(data);
}

// POST /api/reactions → forward the chosen emoji to the backend (+1).
export async function POST(request) {
  const body = await request.json(); // { emoji: "fire" }

  const res = await fetch(`${apiUrl}/reactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
