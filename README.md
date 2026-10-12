# ft-interview-django

Take-home / pairing boilerplate for a **Fresh Tracks Canada** interview.

A working end-to-end hotel search:

- **Backend** — Django 5 + Django REST Framework. Ships with a mock hotel-search client that returns Amadeus-shaped data; swap in a real provider when you have credentials.
- **Frontend** — Next.js 14 (App Router) + Tailwind, with a search form and a results list.
- **Database** — PostgreSQL 16. Hotel searches are persisted so you have something concrete to extend.
- **Everything boots with one command.**

> **Heads up on Amadeus.** Amadeus is shutting down its self-service developer portal in July 2026. This boilerplate defaults to **mock mode** with in-process fixtures so the demo always works. The mock returns the same response shape as the real Amadeus API, so swapping in a real provider later is a one-file change.

---

## Quick start

```bash
cp .env.example .env
docker compose up --build
```

Then open:

- Frontend → <http://localhost:3000>
- Backend health → <http://localhost:8000/api/health>

**Already using 3000, 8000 or 5432?** Set `FRONTEND_HOST_PORT`, `BACKEND_HOST_PORT` or
`POSTGRES_HOST_PORT` in your `.env`. Only the host side moves, and the frontend's API URL
and the backend's CORS origin follow automatically — you don't need to change anything else.

Try a search with `cityCode=PAR` (Paris). Mock cities available out of the box: **PAR, LON, NYC, MAD**. Other city codes return an empty list.

---

## What's wired up

| Endpoint | What it does |
| --- | --- |
| `GET /api/health` | Liveness check. |
| `GET /api/hotels/search?cityCode=PAR&checkInDate=YYYY-MM-DD&checkOutDate=YYYY-MM-DD&adults=1` | Resolves hotels in `cityCode`, then fetches Amadeus offers for them. Logs the search to Postgres. |
| `GET /api/hotels/history` | Last 20 searches from Postgres. |

The view in [`backend/hotels/views.py`](backend/hotels/views.py) calls `get_client()` from [`backend/hotels/amadeus.py`](backend/hotels/amadeus.py), which returns either:

- **MockAmadeusClient** ([`mock_amadeus.py`](backend/hotels/mock_amadeus.py)) — default. Reads fixtures from [`mock_data.py`](backend/hotels/mock_data.py) and synthesises Amadeus-shaped offer responses.
- **AmadeusClient** ([`amadeus.py`](backend/hotels/amadeus.py)) — handles OAuth token caching and batches hotel-IDs into 20-at-a-time offer requests. Activated by `AMADEUS_MODE=live` in `.env`. The class is provider-shaped so you can point `AMADEUS_BASE_URL` at any compatible API.

### Switching to a real provider

```bash
# .env
AMADEUS_MODE=live
AMADEUS_CLIENT_ID=…
AMADEUS_CLIENT_SECRET=…
AMADEUS_BASE_URL=https://your-provider.example.com
```

If your provider's response shape differs from Amadeus, edit the parsing in `amadeus.py` — the rest of the stack (views, DB, frontend) stays the same.

---

## Project layout

```
.
├── docker-compose.yml          # postgres + backend + frontend
├── .env.example                # copy → .env, fill in Amadeus creds
├── backend/
│   ├── Dockerfile
│   ├── entrypoint.sh           # runs migrate + runserver
│   ├── requirements.txt
│   ├── ft_backend/             # Django project (settings, urls)
│   └── hotels/                 # the app
│       ├── amadeus.py          # AmadeusClient + get_client() factory
│       ├── mock_amadeus.py     # MockAmadeusClient (default)
│       ├── mock_data.py        # in-process hotel fixtures
│       ├── views.py            # /search + /history endpoints
│       ├── models.py           # HotelSearch model (audit log)
│       ├── serializers.py
│       └── urls.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── app/
    │   ├── layout.tsx
    │   └── page.tsx            # search form + results list
    └── lib/
        └── api.ts              # typed fetch client
```

---

## Suggested extensions for the interview

The boilerplate is intentionally thin. Pick whichever your interviewer suggests, or whichever feels most natural to you:

- Add a **hotel detail page** that hits a `/api/hotels/<hotelId>` endpoint.
- **Persist favorites** — let the user star a hotel and list them on `/favorites`.
- Add **filters** (price range, board type, rating) on the results page.
- Replace the SSR-less client component with a **React Server Component** that streams results.
- Add **tests** (pytest + DRF APIClient on the backend, Playwright on the frontend).
- Add **caching** (Redis, or DRF's `cache_page`) for the search endpoint — useful even with the mock, essential against a real rate-limited provider.
- Add **observability**: structured logs, a `/metrics` Prometheus endpoint, traces.

---

## Local development without Docker

The Docker compose is the supported path. If you really want to run things locally:

```bash
# Postgres
docker compose up db

# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export POSTGRES_HOST=localhost POSTGRES_PORT=5432   # match POSTGRES_HOST_PORT if you changed it
python manage.py migrate
python manage.py runserver

# Frontend — needs Bun (curl -fsSL https://bun.sh/install | bash)
cd frontend
bun install
bun run dev
```

---

## Notes

- The mock dataset lives in [`backend/hotels/mock_data.py`](backend/hotels/mock_data.py) — add cities or hotels by appending rows.
- Mock prices are deterministically jittered (±15%) by hotel-ID + check-in date, so prices look "real" but the same query always returns the same answer.
- The mock honors `adults` (small uplift) and `nights` (linear multiplier).
- If you turn on `AMADEUS_MODE=live` while the real Amadeus portal still exists, tokens are valid ~30 minutes and the client caches them on the instance.
