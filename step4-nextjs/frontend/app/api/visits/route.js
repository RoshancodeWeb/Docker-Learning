// ─────────────────────────────────────────────────────────────────────
//  THE ROUTE HANDLER (runs on the Next.js SERVER, inside the container)
//
//  THIS is the bridge. It runs on the server — which IS on Docker's
//  private network — so it CAN reach the backend by its service name
//  "api". The browser called us at "/api/visits"; we forward to the real
//  API at "http://api:4000/visits" and pass the answer back.
//
//  API_URL comes from docker-compose (.env) = http://api:4000
// ─────────────────────────────────────────────────────────────────────

export async function GET() {
  const apiUrl = process.env.API_URL || "http://api:4000";

  // Service-to-service call over the Docker network. "api" is the SERVICE
  // NAME from docker-compose.yml — Docker's internal DNS resolves it.
  const res = await fetch(`${apiUrl}/visits`, { cache: "no-store" });
  const data = await res.json();

  return Response.json(data); // { visits: <n> }
}
