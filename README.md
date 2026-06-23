# JobNest

A production-grade **Job Board REST API** built with Node.js, TypeScript, and PostgreSQL. Connects employers, applicants, and admins through a clean, layered backend architecture with real-time notifications, background job processing, and role-based access control.

**Live:** [Backend API](https://job-nest-pwkn.onrender.com) · [API Docs (Swagger)](https://job-nest-pwkn.onrender.com/api/docs) · [Frontend]([https://job-nest-teal.vercel.app](https://job-nest-60dindjjv-niamul-s-projects.vercel.app/))

> Free-tier hosting — first request may take ~30s to wake the server.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL (raw `pg` — no ORM) |
| Cache & Rate Limiting | Redis |
| Auth | JWT + Role-Based Access Control |
| Background Jobs | Bull (Redis-backed queue) |
| Real-time | WebSockets (`ws`) |
| Validation | Zod |
| Testing | Jest |
| API Docs | Swagger (auto-generated from JSDoc) |
| Container | Docker + Docker Compose |
| Deployment | Render (backend) · Vercel (frontend) · Neon (database) |

---

## Roles & Permissions

| Role | Can do |
|---|---|
| **Admin** | Approve/reject job postings, manage platform |
| **Employer** | Create companies, post jobs, review applications, change application status |
| **Applicant** | Browse active jobs, apply with cover letter, receive real-time status updates |

---

## Core Features

**Authentication & Authorization**
- JWT-based auth with signed tokens (not encrypted — identity from the token, never the request body)
- Role-based middleware chain: `protect` (who are you?) → `authorize` (are you permitted?) → `validate` (is the data correct?)
- Object-level authorization: employers can only manage jobs/applications belonging to their own company (ownership chain: application → job → company → `owner_id`)

**Job Lifecycle**
- Employer creates job (draft) → submits for review (pending) → admin approves (active)
- Only active jobs appear in public listings
- Filtered search by category, type, and minimum salary

**Applications**
- Applicants apply with cover letter; duplicate applications prevented by a UNIQUE database constraint on `(job_id, applicant_id)`
- Application status lifecycle: pending → reviewed → accepted / rejected
- Service-level duplicate check for clean error messages + DB constraint as the race-condition safety net

**Real-time Notifications (WebSocket)**
- When an employer changes an application's status, the applicant gets an instant push notification via WebSocket
- Server pushes on purpose — the service explicitly calls `notifyUser()`, which looks up the user's socket by ID in an in-memory Map and sends to only that connection
- Offline fallback: if the user isn't connected, the WebSocket silently no-ops and the email queue guarantees delivery

**Background Email Queue**
- Confirmation emails (on apply) and status-update emails (on status change) processed via Bull queue backed by Redis
- Fire-and-forget design: emails don't block the HTTP response, with `.catch()` error handling so failures are logged, not silently swallowed

**Caching**
- Job listings cached in Redis for fast reads
- Cache invalidation on write: `clearCache()` removes stale `job*` keys after any create/update/delete, so the next request rebuilds from the database

**Testing & Documentation**
- Jest test suite covering core flows
- Swagger API docs auto-generated from JSDoc annotations, available at `/api/docs`

---

## Architecture

```
Request flow:

Client → Express Router → Middleware (protect → authorize → validate) → Controller → Service → Model → PostgreSQL
                                                                                        ↓
                                                                              Bull Queue → Email
                                                                              WebSocket  → Real-time push
                                                                              Redis      → Cache layer
```

**Layer responsibilities:**
- **Route** — URL + method mapping, attaches middleware guards
- **Middleware** — authentication, authorization, validation (no business logic)
- **Controller** — HTTP translator: unpacks request, calls service, wraps response (no business decisions)
- **Service** — all business logic: validation checks, ownership verification, then delegates to model
- **Model** — raw SQL queries via `pg`, no ORM

---

## Project Structure

```
server/
├── src/
│   ├── config/          # Environment, database, Redis, email setup
│   ├── controllers/     # HTTP request/response handling
│   ├── middlewares/      # Auth, RBAC, validation, rate limiting
│   ├── models/          # Raw SQL queries (pg)
│   ├── routes/          # Express route definitions + Swagger JSDoc
│   ├── services/        # Business logic layer
│   ├── types/           # TypeScript interfaces and enums
│   ├── utils/           # Response helpers, cache utils
│   ├── validators/      # Zod schemas
│   └── websocket/       # WebSocket server + notifyUser
├── tests/               # Jest test files
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## Database Schema

| Table | Purpose |
|---|---|
| `users` | Authentication, roles (admin / employer / applicant) |
| `companies` | Employer profiles, linked to `users` via `owner_id` |
| `jobs` | Listings with status lifecycle (draft → pending → active), linked to `companies` |
| `applications` | Applicant submissions with status tracking, UNIQUE constraint on `(job_id, applicant_id)` |

Key constraints:
- `ON DELETE CASCADE` on both foreign keys in `applications` — cleanup from both directions (job deleted or user deleted)
- `UNIQUE (job_id, applicant_id)` — prevents duplicate applications at the database level, even under concurrent requests

---

## Technical Decisions & Lessons

Things I'd talk about in an interview — not just what I built, but why:

**Why raw `pg` instead of an ORM?**
To understand what the ORM abstracts away. Writing raw SQL forced me to think about joins, constraints, and query performance directly. I use Prisma in other projects; here I wanted the fundamentals.

**Why a UNIQUE constraint AND a service-level check for duplicates?**
The service check (`findExistingApplication`) gives a clean "already applied" error message for the normal case. But under concurrent requests (double-click, two tabs), both checks can pass before either writes — a TOCTOU race condition. The UNIQUE constraint is the real guarantee: the database enforces it atomically at insert time. Belt and suspenders.

**Why fire-and-forget for emails but await for the database write?**
The response says "Job Applied." That's only true if the application was saved — so the database write must be awaited. The confirmation email is a side effect: the response is still true without it. So it's queued (not awaited) to avoid blocking the user on SMTP. But fire-and-forget still needs error handling — `.catch()` ensures failures are logged instead of silently lost.

**Why pull `applicant_id` from the JWT instead of the request body?**
The JWT is signed — tamper with the payload and verification fails. The request body is unsigned — a malicious user could put anyone's ID in there and apply as them (impersonation / IDOR). Identity must come from the verified source.

**Why the same error for wrong email and wrong password on login?**
To prevent user enumeration. Different messages ("no account" vs "wrong password") let an attacker discover which emails are registered by scripting login attempts. Identical "invalid credentials" reveals nothing.

---

## Running Locally

```bash
# Clone
git clone https://github.com/niamul007/job-Nest-.git
cd job-Nest-/server

# Install
npm install

# Environment variables
cp .env.example .env
# Fill in: DATABASE_URL, REDIS_URL, JWT_SECRET, EMAIL_* credentials

# Run with Docker (recommended)
docker-compose up

# Or run directly
npm run dev
```

---

## Author

**Niamul** — Backend Developer

- [GitHub](https://github.com/niamul007)
- [X / Twitter](https://x.com/NiamulNotizj)
