# Frontend fix notes (branch `frontend-fixes`)

All 8 fixes are done. `npm run build` (client/) succeeded after each one. The build prints an existing CSS warning (@import order) that is not from these changes. No tests exist for the client, and I did not run the app, so the behavior changes are checked by build only.

## 1. Website link only for http/https
- **Problem:** `company.website` was used as `href` as is, so a `javascript:` value could become a clickable link.
- **Change:** `CompaniesPage.tsx` (CompanyCard) and `CompanyDetailPage.tsx`: link only if the value matches `/^https?:\/\//i`, otherwise plain text.
- **Why:** Matches the server rule. Old rows saved before the server check may still hold other values.
- **Build result:** Success.
- **Unsure about:** Plain text was chosen over hiding it. Easy to change to nothing.

## 2. Cover letter 10 to 1000 characters
- **Problem:** Label said "optional" but the backend needs 10 to 1000 characters.
- **Change:** `JobDetailPage.tsx`: label "Cover letter (required, 10–1000 characters)", textarea `required`, `minLength={10}`, `maxLength={1000}`, and a check in `handleApply` that shows "Cover letter must be at least 10 characters long" (uses trimmed length).
- **Why:** Avoids a failed request and gives a clear message.
- **Build result:** Success.
- **Unsure about:** The browser's own `minLength` message can appear first, since the textarea is `required`. The trimmed check only matters for whitespace padding.

## 3. Backend error messages
- **Problem:** Catch blocks always showed generic text. On the two list pages an error replaced the whole list.
- **Change:** New `client/src/utils/getErrorMessage.ts` (returns `error.response.data.message` if it is a non-empty string, else the fallback). Used in the catch blocks of `CreateJobPage`, `CompanyPage`, `JobDetailPage`, `MyJobsPage`, `PendingJobsPage`. In `MyJobsPage` and `PendingJobsPage` the error is now a small red message above the list and the list still renders.
- **Why:** Users see real reasons (for example validation text). A failed delete or approve no longer hides the list.
- **Build result:** Success.
- **Unsure about:** The error message stays on screen until the page reloads (it is not cleared after a later success). If the initial load fails, the empty-state text shows under the error. Server messages are shown as is.

## 4. Clear stored user on 401
- **Problem:** On 401 only `token` was removed, leaving a stale `user` in localStorage.
- **Change:** `client/src/api/axios.ts`: also `localStorage.removeItem('user')` (and comment updated).
- **Why:** The auth store reads both keys at startup.
- **Build result:** Success.
- **Unsure about:** No 403 handler was added, as asked. A 403 handler would need: (a) a decision on what 403 means here (wrong role, not a bad token, so the user should stay logged in); (b) a place to show it, such as a toast or an error page, since the interceptor has no React context; (c) a redirect target (for example `/dashboard` or a "not allowed" page) and a guard so it does not loop; (d) a rule to skip it for requests where components already handle 403 themselves.

## 5. Page titles
- **Problem:** Every page was titled "client".
- **Change:** `index.html` title is now "JobNest". Each of the 19 pages in `client/src/pages` has a small `useEffect` setting `document.title` to "<Page> | JobNest". `AboutPage` and `HomePage` were changed from expression bodies to block bodies to hold the hook.
- **Why:** Better tabs, history and accessibility.
- **Build result:** Success.
- **Unsure about:** Titles are static. Job and company detail pages say "Job Details" and "Company", not the actual name. The title is not reset when leaving a page, but every page sets its own.

## 6. aria-label on icon-only buttons
- **Problem:** Icon-only buttons had no accessible name.
- **Change:** `DashboardLayout.tsx` mobile menu button: `aria-label="Open menu"`. Searching `client/src` found two more: the show/hide password buttons in `LoginPage.tsx` and `RegisterPage.tsx` (label changes between "Show password" and "Hide password").
- **Why:** Screen readers announced them as empty buttons.
- **Build result:** Success.
- **Unsure about:** The dark overlay in `DashboardLayout` that closes the sidebar is a clickable `div`, not a button. I did not change it. All other buttons have visible text.

## 7. Stop tracking client/.vite
- **Problem:** The Vite cache (`client/.vite/deps/...`, 17 files) was committed.
- **Change:** `git rm -r --cached client/.vite` and added `.vite` to `client/.gitignore`. Files stay on disk. No packages were removed.
- **Why:** It is a generated cache.
- **Build result:** Success.
- **Unsure about:** Nothing.

## 8. /dashboard/applications for applicants only
- **Problem:** Any logged-in user could open the applications page.
- **Change:** `App.tsx`: `<ProtectedRoute allowedRoles={[UserRole.Applicant]}>` on that route.
- **Why:** Employers and admins have no applications of their own. Others are redirected to `/`.
- **Build result:** Success.
- **Unsure about:** I did not check whether the sidebar still shows an "Applications" link to employers or admins. If it does, they would now be sent to the home page.
