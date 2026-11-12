# Fix notes, batch 5

## Task 1: Redis fallback

**Problem:** Every Redis call in `job.service.ts` was unguarded, so a Redis error failed job listing, job detail and every write that clears the cache, even though the database was fine.

**Change:**
- `server/src/services/job.service.ts`: all Redis calls in `getAllJobs`, `getJobById` and the whole body of `clearJobCache` are wrapped in try/catch. Errors are logged with `console.error`. Reads fall back to the database, failed cache writes are ignored, and a failed cache clear does not fail the request.
- `server/src/config/redis.ts`: added `disableOfflineQueue: true` (supported in redis 5.11.0). `reconnectStrategy` and the startup connect logic are unchanged.
- `server/src/__tests__/job.test.ts`: new "when Redis fails" block. It spies on `redisClient.get`, `setEx`, `keys` and `del` to reject, then checks `GET /api/jobs` and `GET /api/jobs/:id` still return 200. It creates and tracks its own job, and restores the spies afterwards.

**Why:** The cache is an optimisation, so losing it must degrade to slower reads, not errors. With `disableOfflineQueue`, commands fail at once while disconnected instead of waiting in a queue.

**Check result:** Full run from `server/`: 4 suites passed, 36 tests passed. An earlier run with Redis stopped (Docker was down) gave 12 passed in `job.test.ts` but a hook timeout in cleanup, and a run before that failed at PostgreSQL connect. Those were environment problems, not code changes.

**Unsure about:**
- `disableOfflineQueue` applies to the shared `redisClient`, so the rate limiter and the Bull email queue use the same client. They may now error during a brief disconnect instead of waiting. I did not check how they handle that.
- The cleanup hook (`redisClient.quit()`) timed out when Redis was down. I did not check whether it also did so before my change.

## Task 2: README

**Problem:** The README was out of date: it listed Docker/Docker Compose and files that are not in the repo, `REDIS_URL` (the real variables are `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`), `npm install`, a `tests/` folder that is really `src/__tests__/`, and `clearCache()` (it is `clearJobCache()`). `client/.env.example` pointed to Railway.

**Change:**
- `README.md`: Redis Cloud added to the deployment row. Docker row, Docker files and `README.md` removed from the structure. Structure and cache notes corrected. "Running Locally" replaced with "Run it locally" (Node 22, Neon, Redis via Docker, env files, `npm ci`, `npm run dev`). Added env variable tables (names only), how to run the tests, and "Known limits". Live URLs kept.
- `client/.env.example`: Railway comment changed to Render.

**Why:** Accuracy. Everything was taken from `env.ts`, `package.json`, the example env files and the code.

**Check result:** Docs only; no tests run for this task. Variable names were compared with `server/src/config/env.ts` and the client `import.meta.env` usages.

**Unsure about:**
- Node 22 is as you specified; there is no `engines` field or `.nvmrc` in the repo.
- `CLIENT_URL` is read with `process.env` in the app and is not in the required list in `env.ts`. Whether it is required is unknown; I listed it as a server variable.
- Railway is still mentioned in `server/server.ts`, `server/src/app.ts` and `server/src/config/swagger.ts` (including a Railway server URL in the Swagger config), and in `docs/audit/*`. I left these alone because the task was docs only. `server/nixpacks.toml` also exists.
- The README project structure no longer lists a Dockerfile or compose file because none are tracked in git. The old Docker instructions were removed for that reason.
- The README author/feature descriptions were not otherwise re-verified.
