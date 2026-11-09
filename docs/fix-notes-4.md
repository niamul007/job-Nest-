# Fix notes - batch 4

## Task 1: stricter auth rate limits

- **Problem:** Login and register only had the global limiter (500 requests / 15 min / IP), too loose to slow password guessing or mass sign-ups. There was also no `trust proxy` setting, so behind a proxy (Render) `req.ip` is probably the proxy's address, meaning all users could share one counter.
- **Change:**
  - `server/src/middlewares/rateLimit.middleware.ts`: new factory `createAuthLimiter` and two exports. `loginLimiter` allows 10 per 15 min per IP (Redis prefix `rateLimit:login`). `registerLimiter` allows 10 per hour per IP (prefix `rateLimit:register`).
  - `server/src/app.ts`: `app.set("trust proxy", 1)` right after `express()` (so it applies to the global limiter too), and `app.post('/api/auth/login', loginLimiter)` and `app.post('/api/auth/register', registerLimiter)` mounted just before the auth router.
- **Why:** Slows brute-force login and bulk registration per client IP. Same style as the existing limiter: 429 with `ApiResponse.error("Too many requests. Please try again later.")`, same X-RateLimit headers, fail open if Redis throws. Both new limiters return immediately when `NODE_ENV === "test"`.
- **How the existing global limiter counts:** `rateLimiter` runs on every request (mounted after CORS, before everything else). Key is `rateLimit:<req.ip>`. It does `INCR`, and on the first hit (count === 1) sets `EXPIRE` 900 s. That is a fixed window: the key expires 15 min after the first request, then counting restarts. Over 500 gives 429. Limit counts all methods and routes, including /health and the OPTIONS preflights. Login and register requests count against both the global and the new limiter.
- **Check result:** `npx tsc --noEmit` clean; Jest 4 suites, 34 tests passed. The limiters are skipped under test, so the 429 behaviour itself is **not tested**.
- **Unsure about:**
  - **Proxy hop count.** `trust proxy` = 1 assumes exactly one proxy in front of the app. If there are two (for example a CDN plus Render's router), `req.ip` would be the inner proxy and limits would be shared; if there are none, a client could spoof `X-Forwarded-For` to dodge the limit. Please confirm the real hop count on Render.
  - Expire is a separate call after INCR; if the process died between them the key would never expire (same as the existing limiter).
  - The window is fixed, not sliding, so a client can burst up to 2x at a window edge.
  - Many users behind one NAT/office IP share the 10/15 min login budget. Failed and successful logins both count.
  - `redisClient.incr` failing/hanging: a hang is not handled by fail-open (only a throw is), same as the existing limiter.
  - The global limiter's reset header is the full window, not the time remaining (existing behaviour, not changed).

## Task 2: npm audit report (`npm audit --omit=dev`, nothing changed, no fix run)

### server/ : 11 vulnerabilities - 1 critical, 6 high, 4 moderate, 0 low

Critical / high findings:

| Package | Severity | Direct or indirect | Used for in this project | Suggested fix |
|---|---|---|---|---|
| proxy-addr | critical | indirect (via express 5.2.1) | Express uses it to compute `req.ip` from `X-Forwarded-For`; this matters now that `trust proxy` is on. Advisory: IP spoofing via IPv4-mapped IPv6 trust subnet. | `npm audit fix` (non-breaking), range 1.1.0-2.0.7 so presumably a newer 2.0.x |
| body-parser | high | indirect (express 5.2.1, v2.2.2) | JSON body parsing (`express.json()`). DoS issues. | `npm audit fix` (non-breaking), affects 2.0.0-2.3.0 |
| brace-expansion | high | indirect (swagger-jsdoc > glob > minimatch, v1.1.13) | Glob matching when swagger-jsdoc reads route files for the API docs. | `npm audit fix` (non-breaking), affects <=1.1.20 |
| js-yaml | high | indirect (swagger-jsdoc > swagger-parser > json-schema-ref-parser, v4.1.1) | Parsing YAML in Swagger/JSDoc comments. | `npm audit fix` (non-breaking), affects 4.0.0-4.3.1 |
| nodemailer | high | direct (^8.0.5) | Sending emails. Many advisories (header injection, file/URL access bypass, address parser DoS, TLS issues). | `npm audit fix --force` would install **nodemailer@10.4.0 (breaking, major jump)**. Needs a manual migration check. |
| ws | high | direct (^8.20.0) | WebSocket library. Memory disclosure and memory exhaustion DoS. | `npm audit fix` (non-breaking), affects 8.0.0-8.20.1 |
| zod | high | direct (^4.3.6) | Request validation schemas. Memory exhaustion on oversized constrained collections. | `npm audit fix` (non-breaking), fixed in 4.6.6 |

Moderate (not detailed as requested): morgan (direct, log forging), qs (indirect via express/superagent), uuid (direct ^13 and under bull; `--force` would install bull@1.1.3, a breaking downgrade, so do not use it).

### client/ : 6 vulnerabilities - 0 critical, 6 high, 0 moderate, 0 low

| Package | Severity | Direct or indirect | Used for in this project | Suggested fix |
|---|---|---|---|---|
| axios | high | direct (^1.15.1, installed 1.15.1) | HTTP client for all API calls. Many advisories (prototype pollution gadgets, proxy/header leaks, ReDoS). | `npm audit fix` (non-breaking), affects 1.0.0-1.19.0 |
| follow-redirects | high | indirect (via axios, 1.16.0) | Redirect handling in axios's Node adapter. | `npm audit fix` (non-breaking) |
| form-data | high | indirect (via axios, 4.0.5) | Multipart encoding in axios. CRLF injection. | `npm audit fix` (non-breaking) |
| react-router | high | indirect (via react-router-dom ^7.14.1) | Client-side routing. Most advisories concern SSR/RSC/framework mode, which this SPA likely does not use; the open-redirect and route-matching DoS ones may apply. | `npm audit fix` (non-breaking), affects up to 7.18.1 |
| react-router-dom | high | direct (^7.14.1) | Routing components (`Link`, `useNavigate`). Flagged only because it depends on vulnerable react-router. | `npm audit fix` (non-breaking) |
| zod | high | direct (^4.3.6) | Form validation with react-hook-form resolvers. | `npm audit fix` (non-breaking), fixed in 4.6.6 |

### Audit notes
- No fix was run in either folder; no package files changed.
- Not verified: whether each advisory is actually reachable in this app. Only the version data npm reported was used.
- The client's axios and the server's nodemailer, ws, zod and proxy-addr are the most relevant to production exposure; nodemailer is the only one that needs a breaking upgrade.
