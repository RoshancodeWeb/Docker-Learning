# Step 5 — Docker Custom Networks 🕸️

A copy of the Step 4 multi-tier app (Next.js → Express → Redis), upgraded to use
**two custom networks** so the tiers are isolated. The goal of this step is to
learn how Docker networking *really* works — not just rely on it.

## The idea

By default, Compose puts every service on **one** network, so any container can
reach any other. That means the **frontend can talk directly to Redis** — which
it should never do. We fix that with two networks, bridged by the backend:

```
        ┌─────────────── frontend-net ───────────────┐
        │   frontend  ⇄  backend                      │
        └─────────────────────│───────────────────────┘
                              │  (backend is on BOTH)
        ┌─────────────────────│─────── backend-net ───┐
        │              backend  ⇄  redis               │
        └──────────────────────────────────────────────┘
```

| Service  | Network(s)               | Can reach            |
|----------|--------------------------|----------------------|
| frontend | `frontend-net`           | backend ✅ · redis ❌ |
| backend  | `frontend-net`, `backend-net` | frontend ✅ · redis ✅ |
| redis    | `backend-net`            | backend ✅ (only)     |

Because **frontend and redis share no network**, the frontend can't even
*resolve* the name `redis` — isolation happens at the DNS level.

## Run it

> Uses port 3000 — stop the Step 4 project first if it's running
> (`cd ../step4 && docker compose down`), or only run one at a time.

```bash
docker compose up --build
# open http://localhost:3000
```

## Prove the isolation

```bash
# 1. frontend → backend  (should WORK)
docker compose exec frontend node -e "fetch('http://backend:4000/health').then(r=>r.json()).then(d=>console.log('✅',d))"

# 2. backend → redis  (should WORK)
docker compose exec backend node -e "const s=require('net').connect(6379,'redis',()=>s.write('PING\r\n'));s.on('data',d=>{console.log('✅',d.toString().trim());s.end()})"

# 3. frontend → redis  (should be BLOCKED → ENOTFOUND redis)
docker compose exec frontend node -e "const s=require('net').connect(6379,'redis',()=>s.write('PING\r\n'));s.on('error',e=>console.log('✅ blocked →',e.message))"
```

## Inspect the networks

```bash
docker network ls                                    # list networks
docker network inspect step5-custom-networks_backend-net   # who's on it
docker compose exec frontend getent hosts backend    # prove DNS resolution
```

## Key takeaways

- Compose auto-creates a `<project>_default` network; here we define our own.
- A container only gets **DNS entries for services on its own networks**.
- Putting tiers on separate networks = isolation by design (defense in depth).
- The **bridge** driver is Docker's standard single-host network type.

The networking config lives in `docker-compose.yml` (see the `networks:` keys on
each service and the top-level `networks:` block).
