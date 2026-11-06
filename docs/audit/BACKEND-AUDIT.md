# Backend Audit — JobNest

Date: 2026-11-03. Read-only audit. Nothing was run. No secret values are shown here.

Tags: **CONFIRMED** = I read the code. **SUSPECTED** = I am guessing from code, not proven. **NOT FOUND** = I searched and it is not there.

**How I found the backend:** The repo has two app folders: `client/` (Vite + React, has `vite.config.ts`, `index.html`) and `server/` (has `server.ts`, Express, `pg`, `db/migrations`). `server/` is the backend. Evidence: `server/package.json:17-35`, `server/server.ts:1-24`.

---

## 1. WHAT THE BACKEND DOES

- A job board API. Employers make companies and jobs. Admin approves jobs. Applicants apply. Employers change application status. Applicants get an email and a live WebSocket message. (`server/src/app.ts:63-67`, `server/src/services/application.service.ts:98-139`)
- **Who calls it:** the React app in `client/` (axios, `client/src/api/*.ts`). Also Swagger UI at `/api/docs` (`app.ts:39`). CORS allows `localhost:5173`, any `*.vercel.app`, and `CLIENT_URL` (`app.ts:17-23`).
- **Deploy:** Railway (SUSPECTED, from comments at `app.ts:69` and `swagger.ts:29`). Nixpacks start command runs migrate then start (`server/nixpacks.toml:8`). No Dockerfile now (NOT FOUND in `git ls-files`).

**Stack (ranges from `server/package.json`; installed versions NOT CHECKED):**

| Part | Package | Range |
|---|---|---|
| Language | TypeScript | ^5.9.3 |
| Web | express | ^5.2.1 |
| DB driver | pg (no ORM) | ^8.20.0 |
| Cache, rate limit | redis | ^5.11.0 |
| Queue | bull | ^4.16.5 |
| Email | nodemailer | ^8.0.5 |
| Realtime | ws | ^8.20.0 |
| Auth | jsonwebtoken ^9.0.3, bcryptjs ^3.0.3 | |
| Validation | zod | ^4.3.6 |
| Security | helmet ^8.1.0, cors ^2.8.6 | |
| Docs | swagger-jsdoc, swagger-ui-express | |
| Tests | jest ^29.7.0, ts-jest, supertest | |

Unused dependencies: `express-validator`, `uuid` (no import found in `server/src`) — SUSPECTED. Node version is NOT FOUND (no `engines`, no `.nvmrc`).

---

## 2. FOLDER MAP

```
server/
  server.ts                 start: HTTP server, WebSocket, email worker, shutdown
  nixpacks.toml             build/start commands (start runs migrate first)
  .env.example              env names (placeholders)
  jest.config.js            jest setup
  db/migrate.ts             runs every .sql file in order
  db/migrations/001..005    users, companies, jobs, applications, notifications
  src/app.ts                Express app: CORS, rate limit, docs, helmet, routes, error handler
  src/config/env.ts         reads + checks env vars
  src/config/db.ts          Postgres pool
  src/config/redis.ts       Redis client
  src/config/swagger.ts     Swagger setup
  src/routes/               5 route files (auth, company, job, application, user)
  src/controllers/          4 controllers (auth, company, job, application)
  src/services/             business rules (auth, company, job, application); email.service.ts is EMPTY (0 bytes)
  src/models/               SQL queries (user, company, job, application)
  src/middlewares/          auth (JWT), rbac (roles), validate (zod), rateLimit, errorHandler
  src/validators/           zod schemas
  src/queues/               email.queue.ts (Bull), email.worker.ts (sends mail)
  src/websocket/ws.server.ts  live messages to a user
  src/types/index.ts        enums + interfaces
  src/utils/ApiResponse.ts  response shape {success, message, data}
  src/__tests__/            4 test files
```

---

## 3. ROUTE LIST

Prefixes from `app.ts:63-67`. "Role" is from `authorize(...)`. Protected = needs `Authorization: Bearer <token>`.

| Method | Path | Access | Handler |
|---|---|---|---|
| GET | /health | public | `app.ts:70` |
| GET | /api/docs | public | `app.ts:39` (Swagger) |
| POST | /api/auth/register | public | `auth.routes.ts:54` → `auth.controller.register` |
| POST | /api/auth/login | public | `auth.routes.ts:95` → `auth.controller.login` |
| GET | /api/companies | public | `company.routes.ts:44` → `company.controller.getAll` |
| GET | /api/companies/:id | public | `company.routes.ts:132` → `getOne` |
| POST | /api/companies | employer | `company.routes.ts:91` → `create` |
| PUT | /api/companies/:id | employer (owner checked in service) | `company.routes.ts:196` → `update` |
| DELETE | /api/companies/:id | employer (owner checked) | `company.routes.ts:247` → `remove` |
| GET | /api/jobs | public | `job.routes.ts:105` → `job.controller.getAll` |
| GET | /api/jobs/pending | admin | `job.routes.ts:149` → `getPending` |
| GET | /api/jobs/company/:company_id | employer (NO owner check) | `job.routes.ts:200` → `getByCompany` |
| GET | /api/jobs/:id | public | `job.routes.ts:329` → `getOne` |
| POST | /api/jobs | employer (owner of company checked) | `job.routes.ts:98` → `create` |
| PUT | /api/jobs/:id | employer (owner checked) | `job.routes.ts:337` → `update` |
| DELETE | /api/jobs/:id | employer (owner checked) | `job.routes.ts:344` → `remove` |
| PATCH | /api/jobs/:id/submit | employer (owner checked) | `job.routes.ts:399` → `submit` |
| PATCH | /api/jobs/:id/approve | admin | `job.routes.ts:454` → `approve` |
| POST | /api/applications | applicant | `application.routes.ts:74` → `apply` |
| GET | /api/applications/my | applicant | `application.routes.ts:172` → `getByApplicant` |
| GET | /api/applications/job/:id | employer (owner checked) | `application.routes.ts:127` → `getByJob` |
| PATCH | /api/applications/:id/status | employer (owner checked) | `application.routes.ts:236` → `updateStatus` |
| GET | /api/users | admin | `user.routes.ts:45` (runs SQL inside the route file) |
| WS | ws://host/?token=<jwt> | token in URL | `ws.server.ts:30,57` |

Notes:
- No "close job" route exists, though status `closed` exists in the DB (`003_create_jobs.sql:34`). NOT FOUND.
- No notifications route. The `notifications` table is never read or written by code (grep: only comments mention it). Table is unused.
- `GET /api/jobs/:id` has no status filter, so draft and pending jobs can be read by anyone (`job.service.ts:100-115`, `job.model.ts:43-47`).

---

## 4. MAIN FLOW — "Applicant applies to a job" (`POST /api/applications`)

1. `server.ts` starts the app. `src/app.ts` handles the request.
2. `middlewares/rateLimit.middleware.ts` — counts the IP in Redis (`:28`).
3. `app.ts:60` `express.json()` — reads the body.
4. `routes/application.routes.ts:74` — runs the chain below.
5. `middlewares/auth.middleware.ts` (`protect`) — checks the JWT, sets `req.user`.
6. `middlewares/rbac.middleware.ts` (`authorize("applicant")`) — else 403.
7. `middlewares/validate.middleware.ts` + `validators/application.validator.ts` — `job_id` must be a UUID, `cover_letter` 10–1000 chars. Else 400.
8. `controllers/application.controller.ts:17` (`apply`) — reads `job_id`, `cover_letter` from body; user id and email from the token.
9. `services/application.service.ts:22` (`applyToJob`):
   - `models/job.model.ts` `findJobById` → job must exist and be `active`.
   - `models/application.model.ts` `findExistingApplication` → no duplicate.
   - `createApplication` → `INSERT ... RETURNING *`.
   - catches Postgres error `23505` (duplicate) → friendly message (`:43`).
   - `queues/email.queue.ts` `emailQueue.add(...)` — fire and forget (`:50-56`).
10. `config/db.ts` pool → PostgreSQL (table `applications`).
11. Back up: service returns the row → controller sends `201 {success, message, data}` (`ApiResponse.ts`).
12. Later, in the background: `queues/email.worker.ts:75` takes the job and sends mail through SMTP.

Any thrown error in this flow becomes HTTP **400** with `error.message` (`application.controller.ts:26-28`).

---

## 5. SLOW OR BACKGROUND WORK

| Work | Where | Inside request or background? | Status / polling |
|---|---|---|---|
| Emails (apply, status change) | `email.queue.ts`, `email.worker.ts` | **Background.** Request only adds a job to the queue and does not wait (`application.service.ts:50`, `:121`). | No status endpoint, no polling. Only console logs (`email.worker.ts:41-44`). |
| Retry | `email.queue.ts:24-36` | Bull: 3 attempts, exponential backoff 2s | Failed jobs are kept forever (`removeOnFail: false`, `:42`). They sit in Redis. |
| WebSocket push on status change | `ws.server.ts:95`, called at `application.service.ts:132` | Inside the request, but cheap (one send) | Live push only. If the user is offline the message is lost (nothing is saved). |
| Worker | `server.ts:9` imports the worker | Runs **in the same process** as the API | A crash or deploy kills both. |
| Job list cache | `job.service.ts:76-115` | Redis cache, 5 min (list) and 10 min (one job) | Cache cleared with `KEYS jobs:*` on any job change (`:33-37`). |
| AI calls | NOT FOUND | | |
| Scraping | NOT FOUND | | |
| Scheduled jobs / cron | NOT FOUND | | |

---

## 6. DATABASE

**Driver:** `pg` with raw SQL and a pool (`config/db.ts:17-23`, max 10). No ORM (NOT FOUND). **DB:** PostgreSQL (hosted; Neon is named in git history).

**Tables** (from `server/db/migrations/`):

| Table | Columns (short) | Links |
|---|---|---|
| users (001) | id UUID PK, name, email UNIQUE, password, role CHECK(admin/employer/applicant), created_at | parent of companies, applications, notifications |
| companies (002) | id, name, description NOT NULL, website, logo_url, owner_id, created_at | `owner_id → users(id) ON DELETE CASCADE` (`:21`) |
| jobs (003) | id, company_id, title, description, location, type CHECK, category, salary_min, salary_max, status CHECK(draft/pending/active/closed) default draft, created_at | `company_id → companies(id) ON DELETE CASCADE` (`:7`) |
| applications (004) | id, job_id, applicant_id, cover_letter, status CHECK(pending/reviewed/accepted/rejected), created_at | `job_id → jobs(id) CASCADE` (`:7`), `applicant_id → users(id) CASCADE` (`:12`), `UNIQUE(job_id, applicant_id)` (`:27`) |
| notifications (005) | id, user_id, message, is_read, created_at | `user_id → users(id) CASCADE` (`:7`). **Never used by code.** |

**Cascade chain:** delete user → their companies → their jobs → all applications on those jobs. Delete company → jobs → applications. A delete of a company (`company.service.ts:61-66`) wipes all applications with no soft delete and no confirm step.

**Indexes:** only the primary keys, `users.email` unique, and `applications(job_id, applicant_id)` unique. No `CREATE INDEX` anywhere (NOT FOUND). Missing and likely needed: `jobs(status)`, `jobs(company_id)`, `companies(owner_id)`, `applications(applicant_id)`. (The unique pair index does help lookups by `job_id`.)

**Migrations:** `server/db/migrate.ts` + 5 SQL files. Run with `npm run migrate`.
- It runs **every file on every deploy** (`nixpacks.toml:8`), no "already ran" table. This works only because every file uses `CREATE TABLE IF NOT EXISTS`. A future `ALTER TABLE` would run again and fail.
- Errors are only logged (`migrate.ts:42-44`); the script still exits 0, so the deploy goes on with a broken schema.
- No rollback files.

**Schema vs migrations vs code:** the 5 tables match `src/types/index.ts` and the model SQL. Mismatches:
- `company.validator.ts:16-19` makes `description` optional but the DB column is `NOT NULL` (`002:10`). Missing description → Postgres error → 400 with DB text.
- `company.validator.ts:22-25` has a `location` field; the companies table has none (`002`). It is accepted and ignored.
- `logo_url` has no validation rule (`company.validator.ts`) but is stored (`company.model.ts:23`).
- `cover_letter` is required by zod (`application.validator.ts:14`) but optional in DB.
- No way to compare with the live database (NOT CHECKED). Whether the live DB matches the files is UNKNOWN.

---

## 7. AUTH

- **Signup:** `POST /api/auth/register` → `auth.service.ts:25-52`. Checks email not taken, hashes password, inserts, returns token + user (no password).
- **Login:** `POST /api/auth/login` → `auth.service.ts:65-84`. Finds user, `bcrypt.compare`, returns token + user.
- **Password hashing:** bcryptjs, cost 10 (`auth.service.ts:37`). Rule: 8+ chars, one letter, one digit (`auth.validator.ts:31-36`). The regex only allows letters, digits and `@$!%*?&` — other symbols are rejected.
- **Token made:** `jwt.sign({id, email, role}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN})` (`auth.service.ts:42-46`, `:75-79`). Algorithm not set (library default HS256 — SUSPECTED). Expiry value is UNKNOWN (env).
- **Token checked:** `auth.middleware.ts:24-38`. Needs `Authorization: Bearer <token>`, `jwt.verify` (no `algorithms` option, NOT FOUND). Role is read from the token, not the DB.
- **Roles:** admin, employer, applicant (`types/index.ts:10-14`). Checked by `authorize()` (`rbac.middleware.ts:14-35`).
- **401 vs 403:**
  - Missing, bad or expired token → **401** (`auth.middleware.ts:25,47,51,54`).
  - Wrong role → **403** (`rbac.middleware.ts:27-31`).
  - Wrong password or unknown email → 401 (`auth.controller.ts:45-46`).
  - Not the owner of a company/job → **400** with "Not authorized", not 403 (`company.service.ts:53`, `job.service.ts:129`, and the controllers' `catch` at `*.controller.ts` return 400).
- **Problems:**
  - **Anyone can register as `admin`.** The role comes from the request body and `admin` is allowed (`auth.validator.ts:39-41`). Admin can approve jobs and list all users. CONFIRMED.
  - Login says "User not found" vs "Invalid credentials" (`auth.service.ts:68,72`) — lets a stranger test which emails exist. CONFIRMED.
  - No token revocation, no refresh token, no logout on server (NOT FOUND). A deleted user's token works until it expires; the middleware does not check the DB.
  - No email verification, no password reset (NOT FOUND).
  - WebSocket takes the token in the URL query (`ws.server.ts:56-57`) — URLs get logged. No Origin check (`ws.server.ts:30`).
  - Client keeps the token in `localStorage` (`client/src/api/auth.api.ts:37-38` shows removal; storage is the same place — SUSPECTED for set). Any XSS steals it.

---

## 8. SECRETS

**Env names read by code** (`server/src/config/env.ts:34-61`, all required, startup throws if missing):
`PORT`, `NODE_ENV`, `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`.
Also read outside `env.ts`: `CLIENT_URL` (`app.ts:21-22`) — **not** in `.env.example` and not checked at startup.

- **`.env` in `.gitignore`?** Yes: `server/.gitignore:8`. (Root `.gitignore`: NOT FOUND.)
- **`.env.example`?** Yes: `server/.env.example` (13 names) and `client/.env.example` (`VITE_API_URL`, `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`). Server values look like placeholders (`DATABASE_URL` is `user:password@host` style) — checked by pattern only. `CLIENT_URL` is missing from it.
- **Real `.env` tracked by git?** No. `git ls-files` shows only the two `.env.example` files.
- **Hard-coded secrets in current files (file:line:name):** none found in app code. In tests only:
  - `server/src/__tests__/auth.test.ts:9,25,38` — `password`
  - `server/src/__tests__/application.test.ts:15,20,25` — `password`
  - `server/src/__tests__/company.test.ts:12` — `password`
  - `server/src/__tests__/job.test.ts:13,19,89` — `password`
  - These are logins for accounts the tests expect to already exist, and may be real accounts on a real database (SUSPECTED).
  - `job.test.ts:14,21` print live JWTs to the console (`employerToken`, `adminToken`).
- **Git history** (178 commits, 6 branches; read-only `git log --all -S...`):
  - No `.env` file was ever committed (`git log --all -- .env*` is empty).
  - `-S api_key`: no hits.
  - `-S password|secret|token`: hits are mostly docs, code and comments.
  - `81fe41a` — `server/docker-compose.yml` (deleted later in `a9baa7f`): `DATABASE_URL`, `JWT_SECRET`, `POSTGRES_PASSWORD`, with local Docker-style values (host is a Compose service). SUSPECTED low risk, but if the same values are used anywhere real, rotate them.
  - `98e99e9` — `server/.env.example`: `DATABASE_URL`, `REDIS_PASSWORD`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS` — placeholder-looking by pattern. SUSPECTED placeholders.
  - `e3edbfd`, `2929ca0`, `ad34826`, `ff3f815` (named "adding new gamil data"): touch `env.ts` / `.env.example` names. Values in `env.ts` are `get("NAME")` calls, not literals.
  - I could not prove none of the history values were ever real. If you ever pasted a real value into `.env.example` and later replaced it, it is still in history.

---

## 9. COST AND ABUSE

- **Paid API calls:** NOT FOUND (no AI, SMS, payment or scraping code in `server/src`). The only outside paid-type services are hosted Postgres, hosted Redis and SMTP. SMTP provider and limits are UNKNOWN. (The client uses EmailJS, `client/.env.example` — out of scope.)
- **Rate limiting:** one global limit, 500 requests per 15 min per IP, stored in Redis (`rateLimit.middleware.ts:13-14,19`). No stricter limit for login, register or apply. If Redis fails, the limiter lets everything through (`:52-54`).
- **Proxy problem:** `trust proxy` is NOT FOUND. If the host sits behind a proxy, `req.ip` may be the proxy for every user, so all users share one bucket of 500 (SUSPECTED). That would either block real users or make the limit useless.
- **Request size:** `express.json()` has no `limit` option (`app.ts:60`). Default Express limit is 100 KB (library default, not set by this repo).
- **File uploads:** NOT FOUND (`logo_url` is only a text string).
- **Pagination:** NOT FOUND. `GET /api/jobs` (`job.model.ts:82`), `GET /api/companies` (`company.model.ts:44`), applications lists and `GET /api/users` return all rows.
- **Things a stranger can spam:**
  - Register unlimited accounts (no email check, no captcha). With the `employer` role they can create unlimited companies and jobs (drafts) → fills the DB. Only the global limit slows them.
  - Login attempts: up to 500 per 15 min per IP.
  - Public `GET /api/jobs/:id` with random IDs: each miss hits Postgres (misses are not cached, `job.service.ts:110-111`).
  - Employers can re-set application status again and again; each change queues an email and a WebSocket push (`application.service.ts:121,132`). Emails go only to the applicant's own address.
  - Email queue failures are never removed (`removeOnFail:false`) → Redis fills slowly.
  - Cache clearing uses `KEYS jobs:*` (`job.service.ts:34`), which blocks Redis as it grows (SUSPECTED at larger size).

---

## 10. VALIDATION AND ERRORS

- **Input check:** zod, via `validate(schema)` on the body only (`validate.middleware.ts:20`). Used on register, login, create company, update company, create job, update job, create application.
- **Not validated:**
  - `PATCH /api/applications/:id/status` — no schema (`application.routes.ts:236`). Any text goes to SQL; the DB `CHECK` rejects bad values, and the error text goes back to the user.
  - URL params (`:id`, `:company_id`) and query strings (`category`, `type`, `salary_min`) (`job.controller.ts:43-49`). A non-UUID id makes Postgres throw an error.
  - `validate` checks but does not replace `req.body` with the clean result, so controllers read the raw body (`validate.middleware.ts:20-31`). Extra fields are ignored by controllers that pick fields by name, but `logo_url` is stored without any check.
  - No check that `salary_max >= salary_min` (`job.validator.ts:42-48`). `category` has no max length (`:32`).
  - Update uses the create schema: `PUT /api/jobs/:id` needs `company_id` in the body, `PUT /api/companies/:id` needs `name`.
- **Error shape:** `{success:false, message}` (`ApiResponse.ts:23-25`). Validation returns only the first issue (`validate.middleware.ts:24-27`).
- **Status codes:** almost every error is **400**, even "not found" and "not authorized" (controllers' `catch`, e.g. `application.controller.ts:27`, `company.controller.ts:79`). 404, 409 are NOT FOUND. Auth controller uses 401/500 (`auth.controller.ts:29,46,49`).
- **Leaks:**
  - `error.message` is sent straight to the client in application, company and job controllers. This includes Postgres or Redis error text if one is thrown (SUSPECTED content, CONFIRMED path).
  - Global handler sends `err.message` with 500 (`errorHandler.middleware.ts:23`).
  - Stack traces are **not** sent (only `console.error`, `:20`). `NODE_ENV` is not used to hide messages.
  - Swagger UI is public in all environments (`app.ts:39`), and lists a production URL (`swagger.ts:29`).
- **404 handler for unknown routes:** NOT FOUND (Express default HTML 404).

---

## 11. TESTS

- **Files:** `server/src/__tests__/auth.test.ts` (46 lines, 3 tests), `company.test.ts` (85, 5), `job.test.ts` (102, 5), `application.test.ts` (116, 5). Root `jest.config.ts` exists and is empty.
- **Framework:** Jest + ts-jest + supertest (`server/jest.config.js`, `package.json:53-55`).
- **How to run (not run by me):** `cd server && npm test` (`jest --coverage`, `package.json:10`).
- **Covers:** register, login (right and wrong password), company create/list/get/update, job create/list/admin approve, apply/duplicate apply/list by job/status update, and 401 or 403 for missing token and wrong role.
- **Does not cover:** `GET /api/users`, `/pending`, submit, delete (job and company), `getByCompany`, 403 cases for companies/applications, validation errors, rate limiter, email worker, WebSocket, cache.
- **Risk:** the tests load the real `app`, which connects to the real DB and Redis from `.env`, with no mocks (`auth.test.ts:2`, `config/db.ts`, `config/redis.ts`). They also log in with accounts that must already exist (`job.test.ts:11-19`, `auth.test.ts:22-33`). If `.env` points at production, running tests writes to production (SUSPECTED). No CI config found (NOT FOUND).

---

## 12. WEAK SPOTS (top 10, worst first)

1. **Anyone can make an admin account.** `auth.validator.ts:39-41` accepts `role: "admin"` on public signup. Admin can approve jobs (`/api/jobs/:id/approve`) and list all users (`/api/users`). Security. **CONFIRMED.**
2. **Job approval can be skipped.** `updateJob` never resets status (`job.service.ts:122-134`, `job.model.ts:91-109`), so an employer can edit an approved job to anything. Also `approveJob` works on any status, including draft (`job.service.ts:178-185`), and `submit` works on any status, including active (`:159-170`). Public data integrity. **CONFIRMED.**
3. **Draft and pending jobs are public.** `GET /api/jobs/:id` has no status check (`job.service.ts:100-115`, `job.model.ts:43-47`). Unapproved content is readable by anyone who has the id. **CONFIRMED.**
4. **Migrations hide failure and re-run on every deploy.** `migrate.ts:42-44` swallows errors and exits 0; `nixpacks.toml:8` runs it on every start; there is no tracking table. A future schema change can silently break production. Data loss risk. **CONFIRMED.**
5. **Delete cascades with no safety.** Deleting a company wipes jobs and all applications (`002:21`, `003:7`, `004:7`); no soft delete, no backup logic in code. Data loss. **CONFIRMED** (schema), accidental use SUSPECTED.
6. **Weak abuse protection.** One global limit (`rateLimit.middleware.ts:13-14`); no login or register limit; fails open (`:52-54`); `trust proxy` missing so the IP may be wrong behind a proxy. Open signup + unlimited companies/jobs can fill the DB. Rate-limit parts **CONFIRMED**; proxy effect **SUSPECTED**.
7. **Error text leaks to clients.** Controllers return `error.message` (`application.controller.ts:27`, `job.controller.ts:34`, `errorHandler.middleware.ts:23`), including raw DB messages. Application status update has no validation (`application.routes.ts:236`), so a bad value shows a DB constraint message. Path **CONFIRMED**; exact leaked text **SUSPECTED**.
8. **Employer data exposure.** `GET /api/jobs/company/:company_id` only needs the employer role, not ownership (`job.routes.ts:200`, `job.service.ts:191-193`). Any employer can list another company's drafts. **CONFIRMED.**
9. **Token and transport weaknesses.** DB TLS check is off (`config/db.ts:19`, `rejectUnauthorized:false`); CORS allows every `*.vercel.app` with credentials (`app.ts:19,27`); JWT has no revocation and role lives in the token; WebSocket token is in the URL (`ws.server.ts:57`); user enumeration on login (`auth.service.ts:68`). **CONFIRMED.**
10. **Scale and reliability gaps.** No indexes beyond keys and no pagination (`job.model.ts:82`); `KEYS` for cache clear (`job.service.ts:34`); job list breaks if Redis is down because the cache calls are not guarded (`job.service.ts:83,90`) while the rate limiter fails open; email worker runs inside the API process (`server.ts:9`); WebSocket map is in memory, so it fails with more than one server (`ws.server.ts:19`). **CONFIRMED** (code); impact at your size SUSPECTED.

Smaller notes: the real tests log live tokens (`job.test.ts:14,21`); `email.service.ts` is empty; `notifications` table is unused; `express-validator` and `uuid` look unused; `description` optional in zod vs `NOT NULL` in DB.

---

## 13. UNKNOWNS (what I could not tell, and what to ask you)

1. Is `.env` (used locally and by tests) pointing at the **production** database and Redis? (Decides how dangerous `npm test` is.)
2. Were any real secrets ever pasted into `.env.example` or `docker-compose.yml` before being replaced? I only checked by pattern. Rotate if unsure.
3. What is `JWT_EXPIRES_IN` in production, and how long is `JWT_SECRET`?
4. Where is it deployed, and is there a proxy in front? (Needed to judge the `trust proxy` problem.)
5. Is public admin signup meant to exist (maybe for demo)? If yes, how will the real admin be made?
6. Which SMTP provider is used (`EMAIL_HOST`), and what are its daily send limits?
7. Does the live database match the 5 migration files? Are there manual changes or indexes I cannot see?
8. Are the test accounts (emails in the test files) real accounts in the live DB?
9. Is there any CI, backup or monitoring setup outside this repo?
10. Installed package versions and Node version: I only read ranges from `package.json`, not `package-lock.json` or `node_modules`.
11. Other branches (`feature/*`) were searched for secrets by keyword only, not code-reviewed.
