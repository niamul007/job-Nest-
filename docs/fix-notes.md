# Backend fix notes (branch `backend-fixes`)

All 9 fixes are done. Full suite after the last fix: 4 suites, 28 tests, all passing, no "Force exiting" message.

## 1. Only the company owner can list a company's jobs
- **Problem:** Any employer could list jobs of any company through `GET /api/jobs/company/:company_id`.
- **Change:** `getJobsByCompany(company_id, userId)` in `server/src/services/job.service.ts` now checks the company exists and the owner matches. `getByCompany` in `job.controller.ts` passes `req.user.id`. Added `createSecondEmployer()` to `helpers/testUsers.ts`.
- **Why:** The other job routes already check ownership; this one skipped it.
- **Test result:** Passed (22 tests). One earlier run had a 5 s `beforeAll` timeout in application.test.ts (slow remote DB). A re-run with no changes passed.
- **Unsure about:** Nothing.

## 2. Same login error for unknown email and wrong password
- **Problem:** An unknown email gave "User not found", which tells an attacker which emails exist.
- **Change:** `login` in `auth.service.ts` throws "Invalid credentials" for both cases. `login` in `auth.controller.ts` only maps "Invalid credentials" to 401.
- **Why:** Same message and status, so no account guessing.
- **Test result:** Passed (23 tests). Added a test for an unknown email.
- **Unsure about:** Nothing. Response timing still differs (bcrypt only runs for known emails).

## 3. migrate.ts exit code
- **Problem:** A failed migration still exited with code 0.
- **Change:** `process.exitCode = 1;` in the catch block of `runMigrations` in `server/db/migrate.ts`.
- **Why:** CI and deploy scripts can now see the failure.
- **Test result:** Passed (23 tests). Not run, as instructed. `tsc --noEmit` was clean.
- **Unsure about:** Nothing.

## 4. Validate application status
- **Problem:** `PATCH /api/applications/:id/status` accepted any string, so a bad value only failed at the database.
- **Change:** `updateApplicationStatusSchema` in `application.validator.ts`, used with `validate` in `application.routes.ts`.
- **Why:** Bad values are rejected early with a clear 400. The values match the DB CHECK constraint.
- **Test result:** Passed (24 tests). Added a test for a bad value.
- **Unsure about:** Nothing.

## 5. 404 and 403 instead of 400 everywhere
- **Problem:** Not found, not authorized and DB errors all returned 400 with raw `error.message`.
- **Change:** New `server/src/utils/httpError.ts` (`toHttpError`, `sendError`). The job, company and application controllers use `sendError`. `errorHandler.middleware.ts` uses it too, so `getByCompany` and `getPending` get proper codes.
  - Message with "not authorized" gives 403.
  - Message with "not found" or "isn't found" gives 404.
  - Other plain errors (business rules) give 400 with their message.
  - Errors with a `code` (pg or Redis) give 500 "Internal Server Error" and are logged on the server only.
  - pg code 22P02 (bad UUID) gives 400 "Invalid ID format".
  - The public read routes keep their old fixed texts on 400/404.
- **Why:** Right status codes, and database text no longer reaches the client.
- **Test result:** Passed (26 tests). Updated "hide a pending job" from 400 to 404. Added tests for company 404 and a malformed id.
- **Unsure about:** See "Needs a decision from me".

## 6. Company website must be http or https
- **Problem:** `z.string().url()` accepts `javascript:alert(1)`.
- **Change:** `.refine(/^https?:\/\//i)` on `website` in `company.validator.ts`.
- **Why:** Stops script URLs that could be rendered as links.
- **Test result:** Passed (27 tests). Added a test for `javascript:alert(1)`. The first run failed because I lost a regex backslash. I fixed it before committing.
- **Unsure about:** `logo_url` is not in the schema at all (see below).

## 7. salary_max >= salary_min
- **Problem:** A job could have a maximum salary below the minimum.
- **Change:** `.refine` on `createJobSchema` in `job.validator.ts` (the same schema is used for create and PUT).
- **Why:** Rejects impossible ranges when both values are given.
- **Test result:** Passed (28 tests). Added a test.
- **Unsure about:** On PUT with only one of the two values, the stored other value is not compared.

## 8. Indexes
- **Problem:** No indexes on the columns used for lookups.
- **Change:** New `server/db/migrations/006_add_indexes.sql` with `CREATE INDEX IF NOT EXISTS` for jobs(status), jobs(company_id), companies(owner_id), applications(applicant_id).
- **Why:** Faster filtering and joins.
- **Test result:** Not run, as instructed. The file is SQL only and the code is unchanged. The full suite passed in the next step.
- **Unsure about:** `migrate.ts` re-runs every file each time, so the older CREATE TABLE files must already be idempotent. I did not check this.

## 9. Test cleanup and clean exit
- **Problem:** Tests left rows in the DB, and Jest needed `forceExit`.
- **Change:** `helpers/testUsers.ts` has `tracked` ids, `trackEmail`, and `cleanupAndClose()`. It deletes tracked applications, jobs and companies by id, then users by email. After that it closes the pg pool, the Bull email queue and the Redis client. Each test file calls it in `afterAll` and records what it created. Removed `forceExit: true` from `jest.config.js`.
- **Why:** Only rows the tests created are deleted. Jest now exits by itself.
- **Test result:** Passed (28 tests), no "Force exiting" message.
- **Unsure about:** I did not query the DB to confirm rows are gone (you said to write only through tests). The `afterAll` would fail the run if a delete errored.

## Needs a decision from me
- **Create job with no user returns 404.** The controller throws "user not found" if `req.user` is missing. That now maps to 404 because of the "not found" text. It should really be 401, but the `protect` middleware already blocks it.
- **Unknown plain errors map to 400.** Any plain `Error` without a `code` gets its message shown with 400. Fine today because services throw fixed messages. A safer design is a small `AppError` class with explicit codes.
- **`logo_url` is not validated** in `createCompanySchema` (and `location` is validated but not stored). It reaches the DB unchecked, so the `javascript:` risk may exist there too. Do you want the same http/https rule?
- **Email jobs stay in Redis.** Tests queue emails to `example.com` addresses and no worker runs, so those Bull jobs are not cleaned up. I did not delete Redis keys.
- **Flaky 5 s hook timeout** in `beforeAll` when the remote DB is slow. Raising `testTimeout` in `jest.config.js` would help. I left it alone.

# Batch 2 (branch `backend-fixes-2`)

## 1. logo_url validation
- **Problem:** `logo_url` was not in the company validator, so it was silently dropped and never checked.
- **Change:** `createCompanySchema` in `server/src/validators/company.validator.ts` now has optional `logo_url`, which must be a URL starting with http:// or https:// (same style as `website`). Added 3 tests in `company.test.ts`: `javascript:alert(1)` rejected (400), valid https accepted (201), no logo accepted (201).
- **Why:** Blocks `javascript:` and `data:` URLs in a field the client renders as an image source.
- **What the client sends for an empty logo:** `CompanyPage.tsx` (lines 73 and 87) sends `logo_url: formData.logo_url || undefined`. An empty input becomes `undefined`, so the key is missing from the JSON. It never sends `""` or `null`.
- **Test result:** 4 suites, 31 tests, all passing.
- **Unsure about:** An empty string `""` or `null` is rejected. The client does not send those, but another client might. The same schema is used for PUT, so an update cannot clear an existing logo (the SQL uses COALESCE).

## 2. Jest testTimeout
- **Problem:** Hooks hit the 5 s default timeout when the remote DB is slow.
- **Change:** `testTimeout: 30000` in `server/jest.config.js`.
- **Why:** Avoids flaky `beforeAll` failures.
- **Test result:** 4 suites, 31 tests, all passing. (I applied this before fix 1 to be able to verify it, but each is its own commit.)
- **Unsure about:** Nothing.

## 3. Open handle
- **Problem:** Jest sometimes printed "did not exit one second after the test run".
- **Finding:** With Redis running, `--detectOpenHandles` reported no open handles, and no run printed "did not exit" or hung. When Redis was NOT reachable, Jest hung and every test timed out. The cause is `server/src/config/redis.ts`: `reconnectStrategy` (line 24) retries forever every 500 ms max, and `redisClient.connect()` (line 34) keeps the socket loop alive, so the process never exits and requests that need Redis never resolve.
- **Change:** None. The cause is in app code, so I did not change it.
- **Why:** Rules say app code stays untouched. A fix would be a bounded reconnect strategy or a mocked Redis in tests.
- **Test result:** 31 tests passing with `--detectOpenHandles`, no handles reported.
- **Unsure about:** I did not reproduce a hang with Redis up, so a rare open handle may remain that this run did not catch.
