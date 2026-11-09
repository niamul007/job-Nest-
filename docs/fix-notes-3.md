# Fix notes - batch 3

## Fix 1: password rule
- **Problem:** Register only allowed letters, digits and `@$!%*?&`, so passwords like `Test1234#@` were rejected.
- **Change:** `server/src/validators/auth.validator.ts` now uses `/^(?=.*[A-Za-z])(?=.*\d)\S{8,72}$/` with message "Password must be 8-72 characters and include a letter and a number". Tests added in `server/src/__tests__/auth.test.ts` (symbols accepted, 7 chars rejected, no digit rejected).
- **Why:** Allow any non-space symbols; 72 is bcrypt's byte limit.
- **Check result:** Jest 4 suites, 34 tests passed.
- **Unsure about:** Reject tests assert status 400 and success=false (passed). The 72 limit counts characters, while bcrypt counts bytes, so multi-byte characters could exceed 72 bytes. The old separate `.min(8)` message was removed (one message now).

## Fix 2: job approve test
- **Problem:** The submit call in "should approve job as admin" was unchecked, so a failed submit would surface only as a confusing approve failure.
- **Change:** `server/src/__tests__/job.test.ts` stores the submit response and expects 200.
- **Why:** Fail at the real point of failure.
- **Check result:** Jest 4 suites, 34 tests passed.
- **Unsure about:** Nothing.

## Fix 3: MyJobsPage company load error
- **Problem:** If the companies response had no success or data, fetchJobs returned silently with no feedback.
- **Change:** `client/src/pages/MyJobsPage.tsx` calls `setError('Could not load your company')` before returning.
- **Why:** Show the user that loading failed.
- **Check result:** `npm run build` succeeded (existing CSS @import warning only).
- **Unsure about:** Not exercised in a browser.
