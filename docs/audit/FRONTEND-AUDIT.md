# FRONTEND AUDIT — JobNest

Read-only audit. Paths are relative to the repo root. Secret values are never shown.
Tags: **CONFIRMED** = seen in code. **SUSPECTED** = guess. **NOT FOUND** = searched, absent.

**Which folder is the frontend?** `client/`. Why: it has `client/package.json` with react, vite and react-router-dom, plus `client/index.html` and `client/src/main.tsx`. The other folder, `server/`, has `server/server.ts`, express routes and SQL migrations (git ls-files). Pages, API wrappers and stores exist only under `client/src`.

---

## 1. WHAT THE FRONTEND DOES

- **Purpose:** a job board. Visitors browse jobs and companies. Applicants apply. Employers manage a company, post jobs and review applicants. Admins approve jobs and list users (`client/src/App.tsx:39-144`, `client/src/components/DashboardLayout.tsx:31-50`).
- **Users:** three roles: applicant, employer, admin (`DashboardLayout.tsx:31-50`).
- **Stack (`client/package.json`):**
  - react ^19.2.5, react-dom ^19.2.5
  - react-router-dom ^7.14.1
  - zustand ^5.0.12 (state)
  - axios ^1.15.1 (HTTP)
  - zod ^4.3.6, react-hook-form ^7.72.1, @hookform/resolvers ^5.2.2 (listed; see section 8)
  - @emailjs/browser ^4.4.1 (contact form)
  - lucide-react ^1.11.0 (icons)
  - tailwindcss ^4.2.2 + @tailwindcss/vite
  - typescript ~6.0.2, eslint ^9.39.4
- **Build tool:** Vite ^8.0.9 (`client/package.json:39`, `client/vite.config.ts`). Build script is `tsc -b && vite build` (`package.json:8`).

## 2. FOLDER MAP

- `client/` — the frontend app
  - `index.html` — HTML shell (title is `client`, line 7)
  - `package.json`, `package-lock.json` — deps and scripts
  - `vite.config.ts` — plugins: react, tailwind
  - `vercel.json` — SPA rewrite of every path to `/index.html`
  - `.env.example` — public variable names
  - `.gitignore` — ignores `.env`, `*.local`, `dist`
  - `eslint.config.js`, `tsconfig*.json` — lint and TypeScript config
  - `README.md` — default Vite template text
  - `.vite/deps/` — Vite dev cache, **committed to git** (see section 14)
  - `public/` — `favicon.svg`, `icons.svg`
  - `src/main.tsx` — mounts `<App />` in StrictMode
  - `src/App.tsx` — all routes
  - `src/index.css`, `src/App.css` — styles (Tailwind import, Google Fonts import at `index.css:3`)
  - `src/api/` — axios instance and one wrapper file per backend area (auth, jobs, applications, companies, users)
  - `src/store/` — Zustand stores: `authStore.ts`, `jobStore.ts`
  - `src/types/index.ts` — shared TypeScript types and `UserRole`
  - `src/components/` — 6 shared components
  - `src/pages/` — 19 page files
  - `src/assets/` — images
- `server/` — backend (out of scope)
- `jest.config.ts` (repo root) — Jest config; no frontend test files (see section 13)

## 3. PAGES AND ROUTES

All routes are in `client/src/App.tsx`.

| URL | Needs login? | File | Line |
|---|---|---|---|
| `/` | No | `pages/HomePage.tsx` | 41 |
| `/login` | No | `pages/LoginPage.tsx` | 42 |
| `/register` | No | `pages/RegisterPage.tsx` | 43 |
| `/jobs` | No | `pages/JobsPage.tsx` | 44 |
| `/jobs/:id` | No (apply button sends you to /login) | `pages/JobDetailPage.tsx` | 45 |
| `/companies` | No | `pages/CompaniesPage.tsx` | 139 |
| `/companies/:id` | No | `pages/CompanyDetailPage.tsx` | 140 |
| `/about` | No | `pages/AboutPage.tsx` | 143 |
| `/contact` | No | `pages/ContactPage.tsx` | 144 |
| `/dashboard` | Yes, any role | `pages/DashboardPage.tsx` | 50 |
| `/dashboard/applications` | Yes, any role | `pages/MyApplicationsPage.tsx` | 60 |
| `/dashboard/profile` | Yes, any role | `pages/ProfilePage.tsx` | 110 |
| `/dashboard/jobs` | Employer | `pages/MyJobsPage.tsx` | 70 |
| `/dashboard/jobs/create` | Employer | `pages/CreateJobPage.tsx` | 80 |
| `/dashboard/company` | Employer | `pages/CompanyPage.tsx` | 90 |
| `/dashboard/applicants` | Employer | `pages/ApplicantsPage.tsx` | 100 |
| `/dashboard/pending` | Admin | `pages/PendingJobsPage.tsx` | 120 |
| `/dashboard/users` | Admin | `pages/AllUsersPage.tsx` | 130 |
| `*` (anything else) | No | `pages/NotFoundPage.tsx` | 147 |

Note: `/dashboard/applications` is "any logged-in user" in the route (`App.tsx:58-66`). The comment says applicant only in the API file. Employers and admins can open the page. SUSPECTED: it just shows an empty list or a backend 403 error.

## 4. COMPONENTS

Only 6 shared components exist (`client/src/components/`):

1. `ProtectedRoute.tsx` — redirects to `/login` if not logged in. Redirects to `/` if the role is not allowed (lines 29-46).
2. `DashboardLayout.tsx` — sidebar per role, mobile hamburger, footer. Contains an inner `Sidebar` with logout.
3. `Navbar.tsx` — top bar for public pages, has logout.
4. `Footer.tsx` — page footer.
5. `LoadingSpinner.tsx` — spinner shown while loading.
6. `CompanyAvatar.tsx` — company logo image, falls back to two-letter initials if the image fails (lines 40-61).

## 5. DATA FLOW

- **Library:** axios. One shared instance in `client/src/api/axios.ts:12`. Comment says "never import axios directly".
- **Base URL:** `import.meta.env.VITE_API_URL || 'http://localhost:5000/api'` (`axios.ts:14`). The fallback means a production build with the variable unset would call localhost. SUSPECTED risk.
- **Main action followed: "Apply for a job"**
  1. User opens `/jobs/:id` — `src/App.tsx:45` renders `src/pages/JobDetailPage.tsx`.
  2. Page loads the job: `fetchJob()` (`JobDetailPage.tsx:30-45`) calls `getJobById` in `src/api/jobs.api.ts:25`, which uses the axios instance `src/api/axios.ts` to send `GET /jobs/:id`.
  3. User clicks "Apply now". If not logged in, `navigate('/login')` (`JobDetailPage.tsx:166`). Otherwise the form shows.
  4. User types a cover letter and submits. `handleApply` (`JobDetailPage.tsx:48-72`) calls `applyForJob({ job_id, cover_letter })` in `src/api/applications.api.ts:21`.
  5. Request goes `POST /applications` through `src/api/axios.ts`. The request interceptor adds `Authorization: Bearer <token>` from localStorage (`axios.ts:27-33`).
  6. On success the page sets "Application submitted successfully!" and hides the form (`JobDetailPage.tsx:61-63`), shown at lines 148-150. On failure it shows a generic message (`JobDetailPage.tsx:67-68`).
- Files passed through: `App.tsx` → `pages/JobDetailPage.tsx` → `api/applications.api.ts` → `api/axios.ts` → backend; `store/authStore.ts` supplies `isAuthenticated`.
- Other: contact form does not use the backend. It calls EmailJS directly from the browser (`pages/ContactPage.tsx:22-32`).

## 6. STATE

- **Auth:** Zustand store `store/authStore.ts`, initial value read from localStorage (lines 30-34).
- **Jobs:** Zustand `store/jobStore.ts` exists (jobs, loading, error). Grep for `useJobStore` usage was not done on every page. SUSPECTED: unused, because the pages I read (`JobsPage`, `JobDetailPage`) use their own `useState`. Treat as NOT VERIFIED.
- **Everything else:** component `useState` plus `useEffect` fetches. No cache library (no react-query or SWR in `package.json`).
- **Loading state:** yes. Pages use `loading` state and `<LoadingSpinner />` (`JobsPage.tsx:135-137`, `MyApplicationsPage.tsx:52-53`). Buttons show "Submitting..." / "Creating account...".
- **Error state:** yes, per page `error` state with a message (e.g. `JobsPage.tsx:73`, `JobDetailPage.tsx:42`).
- **Gap:** most catch blocks drop the backend message and show a generic one (`JobDetailPage.tsx:67`, `CreateJobPage.tsx:74`, `CompanyPage.tsx:97`). Only login and register show the backend message (`LoginPage.tsx:31`).

## 7. AUTH ON THE FRONTEND

- **Token storage:** `localStorage` keys `token` and `user` (`authStore.ts:42-43`, `axios.ts:28`). Readable by any script on the page. Cookie and sessionStorage: NOT FOUND.
- **Sending:** axios request interceptor, `Authorization: Bearer` header (`axios.ts:27-33`).
- **Route guard:** `ProtectedRoute` checks `isAuthenticated` (derived from "a token string exists", `authStore.ts:34`) and the role from the stored `user` object (`ProtectedRoute.tsx:34-43`). It is a UI convenience only. The real check must be on the backend.
- **Token expiry / 401:** response interceptor (`axios.ts:45-59`): on 401 for any URL except login/register it removes `token` and sets `window.location.href = '/login'` (full page reload).
  - It does not remove the `user` key. The reload resets the Zustand store from localStorage, so `isAuthenticated` is false but stale user data stays. CONFIRMED (`axios.ts:53` removes only `token`).
  - No client-side check of token expiry time. NOT FOUND.
- **403:** no global handler. NOT FOUND (`grep 403` in `src` finds only comments). Each page shows its own generic error.
- **Logout:** `authStore.logout()` clears both keys and state (`authStore.ts:52-56`). Called from Navbar and Sidebar. An unused helper `auth.api.ts:36-39` also clears storage without touching Zustand.
- **Role in UI:** role comes from the `user` JSON in localStorage, which a user can edit. This would only unlock hidden pages. Backend must reject. SUSPECTED that the backend does (routes use `authorize(...)`, e.g. `server/src/routes/company.routes.ts:91`).
- **Register role:** the form offers only Job seeker and Employer (`RegisterPage.tsx:135-136`), but the backend accepts `"admin"` as a role in the register schema (`server/src/validators/auth.validator.ts:55`). CONFIRMED that the schema allows it. Whether `auth.service` blocks it: SUSPECTED not (`server/src/services/auth.service.ts:29-38` passes role straight to `createUser`).

## 8. FORMS AND VALIDATION

`react-hook-form`, `zod` and `@hookform/resolvers` are installed, but grep for `useForm` / `zodResolver` in `src` found NOT FOUND. All forms use plain `useState` and HTML attributes.

| Form | File | Browser checks | Backend re-checks? |
|---|---|---|---|
| Login | `LoginPage.tsx:58-84` | `type=email`, `required` | Yes: `loginSchema`, `server/src/routes/auth.routes.ts:95` |
| Register | `RegisterPage.tsx:64-135` | `type=email`, `required` on name/email/password. No length or strength rule. | Yes: name 2-50, password 8+ with letter and digit, role enum (`auth.validator.ts:31-58`). Wrong password shape gives a backend message shown at `RegisterPage.tsx:37`. |
| Contact | `ContactPage.tsx:72-132` | `required`, `type=email` | NOT APPLICABLE. Sent to EmailJS, no backend. |
| Create job | `CreateJobPage.tsx:93-215` | `required` on company/title/description/location/category; number inputs for salary. No max length. | Yes: `createJobSchema` (`job.validator.ts:108-147`). Failures show only "Failed to create job" (`CreateJobPage.tsx:74`). |
| Company profile | `CompanyPage.tsx:164-215` | `required` on name/description; `type=url` on website and logo | Yes: `createCompanySchema` (`company.validator.ts:76-99`). Backend says description is optional, form requires it. |
| Apply | `JobDetailPage.tsx:172-180` | Label says "Cover letter (optional)". No `required`. | Backend **requires** 10-1000 chars (`application.validator.ts:14-16`). CONFIRMED mismatch: an empty cover letter gets a 400 and the user sees only "Failed to submit application". |
| Salary min > max | `CreateJobPage.tsx:195-209` | NOT FOUND | NOT FOUND in `job.validator.ts` |
| Job filters, search | `JobsPage.tsx` | Client-side only filtering; no submit | — |
| Application status update | `ApplicantsPage.tsx:85` | button/choice | SUSPECTED backend validates (not read) |

## 9. SECRETS AND PUBLIC VARIABLES

Env names used in frontend code (`import.meta.env`):

| Name | Where | In browser bundle? | Real secret? |
|---|---|---|---|
| `VITE_API_URL` | `src/api/axios.ts:14` | Yes (VITE_ prefix) | No. It is a URL. |
| `VITE_EMAILJS_SERVICE_ID` | `src/pages/ContactPage.tsx:23` | Yes | No (public by design) |
| `VITE_EMAILJS_TEMPLATE_ID` | `ContactPage.tsx:24` | Yes | No |
| `VITE_EMAILJS_PUBLIC_KEY` | `ContactPage.tsx:31` | Yes | No. EmailJS public key is meant to be public. But anyone can reuse it to send mail through your EmailJS account, so use EmailJS domain allow-list and rate limits. SUSPECTED not set. |

- `.env` in `.gitignore`: yes, `client/.gitignore:37`. `*.local` also ignored (line 13). Patterns like `.env.production` or `.env.development` are **not** ignored. SUSPECTED risk if such a file is created.
- `.env.example`: exists at `client/.env.example` (names only, placeholder values).
- No `.env` file tracked: `git ls-files` shows only `client/.env.example` and `server/.env.example`.
- Git history for `.env` files: `git log --all -- '*.env' '.env'` returned nothing.
- Hard-coded secret search (key/secret/password/token/bearer assigned to a string literal) across `client/src`, `index.html`, `vercel.json`, `README.md`: none found. NOT FOUND.

## 10. SECURITY IN THE BROWSER

- `dangerouslySetInnerHTML`, `innerHTML`, `eval(`: NOT FOUND in `client/src`.
- User text (names, descriptions, cover letters) is rendered as normal React text, which is escaped. CONFIRMED by absence of raw HTML APIs.
- **Link from user input:** `company.website` goes straight into `href` in `pages/CompaniesPage.tsx:26` and `pages/CompanyDetailPage.tsx:79`, with `target="_blank"` and `rel="noopener noreferrer"` (good). There is no check that it starts with `http://` or `https://`. The backend only checks `z.string().url()` (`company.validator.ts:96`). SUSPECTED: a value like `javascript:...` could pass, since URL parsers accept it. Visitors who click it could run script in your site's origin. Combined with tokens in localStorage (section 7), that could steal sessions. Not tested.
- **Image from user input:** `logo_url` goes into `<img src>` (`CompanyAvatar.tsx:49`). Lower risk. It can leak visitor IPs to a third-party host, SUSPECTED low.
- Combo risk: tokens in localStorage mean any XSS equals account takeover.
- `window.location.href = '/login'` is a fixed string (`axios.ts:54`). Not user input.
- `confirm(...)` for deleting a job (`MyJobsPage.tsx:56`). Fine.
- Security headers / CSP: NOT FOUND in `vercel.json` (only rewrites).

## 11. BUILD AND DEPLOY

- Scripts (`client/package.json:6-11`): `dev` = `vite`, `build` = `tsc -b && vite build`, `lint` = `eslint .`, `preview` = `vite preview`. No `start`, no `test`.
- Deploy: Vercel. Evidence: `client/vercel.json` (SPA rewrite) and the README link to a `vercel.app` host (`README.md:5`). Config only sets the rewrite.
- Live URLs in `README.md:5`: frontend on vercel.app (a deployment-specific URL, not a stable custom domain), backend `job-nest-pwkn.onrender.com`, Swagger at `/api/docs`.
- Backend host: README says Render; `client/.env.example:3` says "Railway", and `server/nixpacks.toml` exists. Inconsistent docs. CONFIRMED mismatch; which is real: UNKNOWN.
- Is `VITE_API_URL` set on Vercel? UNKNOWN (cannot see Vercel settings).

## 12. USER EXPERIENCE BASICS

- **Responsive:** yes in part. Viewport meta is set (`index.html:6`). Dashboard has a mobile sidebar with hamburger (`DashboardLayout.tsx:93-98, 189-195`). Only about 11 lines in `src` use `sm:/md:/lg:` prefixes (grep count), so other pages may rely on flex-wrap only. SUSPECTED partly responsive.
- **Loading spinners:** yes (`LoadingSpinner.tsx`; used on Jobs and My Applications).
- **Empty states:** yes (`JobsPage.tsx:138-143`, `ApplicantsPage.tsx:117-121`, `MyApplicationsPage.tsx:56`, `CreateJobPage.tsx:113`).
- **Error messages:** yes, but often generic (section 6).
- **Page titles:** every page shows the same `<title>client</title>` (`index.html:7`). `document.title` is never set, NOT FOUND. Bad for tabs, bookmarks, SEO.
- **Alt text:** the only `<img>` has `alt` (`CompanyAvatar.tsx:50`). Other icons are SVGs/lucide with no label.
- **Accessibility:** icon-only buttons (mobile menu `DashboardLayout.tsx:190-195`) have no `aria-label`. SUSPECTED more of the same.
- **Language:** `<html lang="en">` is set.
- **Delete confirm** for jobs uses the browser `confirm`. Company delete API exists (`companies.api.ts:52`); a UI for it was not checked.
- **Font:** loads Inter from Google Fonts (`index.css:3`).

## 13. TESTS

- Frontend test files: NOT FOUND (no `*.test.*` or `*.spec.*` under `client/`; no `test` script or test library in `client/package.json`).
- Existing tests are backend only: `server/src/__tests__/{application,auth,company,job}.test.ts`, run by Jest (`server/jest.config.js`, root `jest.config.ts`). Not run, as requested.
- Frontend coverage: 0%.

## 14. WEAK SPOTS (ranked)

1. **Tokens in localStorage** — any XSS steals logins (`authStore.ts:42-43`, `axios.ts:28`). CONFIRMED.
2. **Unvalidated `website` link in `href`** — possible `javascript:` URL from company owners, runs for visitors (`CompaniesPage.tsx:26`, `CompanyDetailPage.tsx:79`; backend `company.validator.ts:96`). SUSPECTED (not exploited).
3. **Backend accepts `role: "admin"` at register** — if `auth.service` does not block it, anyone can create an admin by calling the API directly (`auth.validator.ts:55`, `auth.service.ts:29-38`). CONFIRMED that the schema allows it; exploitability SUSPECTED. It is a backend issue but reachable from this frontend's API.
4. **Role checks in the UI use editable localStorage data** (`ProtectedRoute.tsx:41`, `authStore.ts:30-32`). Real protection depends entirely on the backend. SUSPECTED OK on the backend, not verified.
5. **Apply form says cover letter is optional, backend needs 10+ chars** — real users hit a failure with an unhelpful message (`JobDetailPage.tsx:172`, `application.validator.ts:14`). CONFIRMED.
6. **Backend error messages thrown away** in most forms, so users cannot fix input (`CreateJobPage.tsx:74`, `CompanyPage.tsx:97`, `JobDetailPage.tsx:67`). CONFIRMED.
7. **401 handling leaves `user` in localStorage and hard-reloads the page**; no 403 handling; no expiry check; a half-filled form is lost (`axios.ts:48-57`). CONFIRMED.
8. **API URL falls back to localhost** if `VITE_API_URL` is missing at build time (`axios.ts:14`). SUSPECTED (depends on Vercel settings).
9. **Zero frontend tests**, and build is `tsc -b && vite build` with no CI file seen. CONFIRMED (no CI config checked: NOT FOUND in the files I read).
10. **Housekeeping:** `client/.vite/deps/*` committed to git (cache files; `.gitignore` has no `.vite` rule); every page has title `client`; unused installed deps (`react-hook-form`, `zod`, `@hookform/resolvers`) and the `@types/react-router-dom` v5 types next to react-router v7. CONFIRMED. Also EmailJS public key can be abused without domain limits, SUSPECTED.

## 15. UNKNOWNS (questions for you)

1. Is `VITE_API_URL` set in Vercel, and to what host? Is the backend on Render or Railway?
2. Does the backend block `role: "admin"` at register? (I did not read all of `auth.controller.ts` / `user.model.ts`.)
3. Is the EmailJS public key restricted to your domain in the EmailJS dashboard?
4. Does the backend reject non-http(s) company websites? Not tested.
5. Is `jobStore.ts` used anywhere? I did not search every page.
6. Do the pages I did not read in full (`HomePage`, `DashboardPage`, `AboutPage`, `AllUsersPage`, `PendingJobsPage`, `ProfilePage`, `ApplicantsPage`, `MyJobsPage`, `Navbar`) hold anything extra (hard-coded data, extra forms)? I checked them only by grep for risky APIs.
7. Is there a CI pipeline (for example `.github/`)? The file list showed none.
8. Is there a custom domain, or only the Vercel preview-style URL in the README?
