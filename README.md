# 🪺 JobNest

> A full-stack job platform connecting employers, applicants, and admins.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**Live demo:** [job-nest-61q5muuou-niamul-s-projects.vercel.app](https://job-nest-61q5muuou-niamul-s-projects.vercel.app/)  
**API docs:** [Railway backend `/api/docs`](https://job-nest-61q5muuou-niamul-s-projects.vercel.app/) · **Repo:** [github.com/niamul007/job-Nest-](https://github.com/niamul007/job-Nest-)

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Auth | JWT authentication with role-based access control (RBAC) |
| 👥 Roles | Admin · Employer · Applicant — each with scoped permissions |
| 📋 Jobs | Post, filter, paginate, and manage job listings |
| ✅ Approval flow | Employers submit jobs → admin approves before going live |
| 📨 Applications | Apply with cover letter, track status in real time |
| ⚡ Real-time | WebSocket notifications pushed to connected clients |
| 📬 Email | Background email notifications via Bull queue + Nodemailer |
| 🧠 Caching | Redis caching on job listings and session data |
| 🛡️ Rate limiting | Custom Redis-backed rate limiter per IP |
| 📖 API docs | Swagger UI with JWT auth at `/api/docs` |
| 📱 Responsive | Mobile-first React frontend with Tailwind CSS v4 |
---

## 🗂️ Tech Stack

### Backend

| Layer | Technology | Version |
|---|---|---|
| Language | TypeScript | 5.x |
| Runtime | Node.js | 20+ |
| Framework | Express.js | 5.x |
| Database | PostgreSQL (Neon cloud) | 15+ |
| Query | Raw SQL via `pg` pool | — |
| Cache | Redis (Redis Cloud) | 5.x |
| Auth | JWT + RBAC | jsonwebtoken 9.x |
| Queue | Bull + Nodemailer | 4.x |
| Real-time | WebSockets (`ws`) | 8.x |
| Validation | Zod | 4.x |
| API docs | Swagger UI (swagger-jsdoc + swagger-ui-express) | — |
| Rate limit | Custom Redis middleware | — |
| Container | Docker + Docker Compose | — |

### Frontend

| Layer | Technology | Version |
|---|---|---|
| Framework | React + Vite | 19.x / 8.x |
| Language | TypeScript | 6.x |
| Styling | Tailwind CSS | v4 |
| State | Zustand | 5.x |
| HTTP | Axios | 1.x |
| Routing | React Router | v7 |
| Icons | Lucide React | — |
| Email | EmailJS (`@emailjs/browser`) | — |

---

## 👥 Roles & Permissions

| Role | Permissions |
|---|---|
| `admin` | Approve/reject job listings, view all users, platform overview |
| `employer` | Create company profile, post jobs, review applicants, manage listings |
| `applicant` | Browse jobs, apply with cover letter, track application status |

---

## 📁 Project Structure

```
job-Nest/
├── client/                      # React + Vite frontend
│   ├── src/
│   │   ├── api/                 # Axios instance + per-resource API calls
│   │   ├── components/          # Navbar, Footer, CompanyAvatar, DashboardLayout…
│   │   ├── hooks/               # useAuth, useJobs custom hooks
│   │   ├── pages/               # HomePage, JobsPage, CompanyDetailPage, Dashboard…
│   │   ├── store/               # Zustand stores (authStore, jobStore)
│   │   ├── types/               # Shared TypeScript interfaces & enums
│   │   └── utils/               # Formatting helpers
│   ├── .env.example
│   └── package.json
│
├── server/                      # Express TypeScript backend
│   ├── src/
│   │   ├── config/              # env.ts, db.ts, redis.ts, swagger.ts
│   │   ├── controllers/         # auth, job, company, application, user
│   │   ├── middlewares/         # auth, rbac, validate, errorHandler, rateLimit
│   │   ├── routes/              # Express routers (mounted at /api/*)
│   │   ├── services/            # Business logic & email queue
│   │   ├── types/               # TypeScript types, Express Request augmentation
│   │   ├── utils/               # ApiResponse, JWT helpers
│   │   └── validators/          # Zod schemas for request bodies
│   ├── db/                      # SQL migration scripts
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or [Neon](https://neon.tech))
- Redis instance (local or [Redis Cloud](https://redis.io/cloud))

### 1. Clone the repo

```bash
git clone https://github.com/niamul007/job-Nest-.git
cd job-Nest-
```

### 2. Set up the backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env and fill in all values (see Environment Variables below)
npm run migrate        # creates tables in your PostgreSQL database
npm run dev            # starts API server on http://localhost:5000
```

### 3. Set up the frontend

```bash
cd ../client
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
# Set VITE_EMAILJS_* values (see Contact Form section below)
npm run dev            # starts dev server on http://localhost:5173
```

### 4. (Optional) Run with Docker

```bash
# From the repo root
docker-compose up
```

---

## 🔑 Environment Variables

### Backend — `server/.env`

Create `server/.env` from `server/.env.example`:

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the API server listens on | `5000` |
| `NODE_ENV` | Environment (`development` / `production`) | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `REDIS_HOST` | Redis server hostname | `redis-12345.c1.us-east-1-2.ec2.cloud.redislabs.com` |
| `REDIS_PORT` | Redis server port | `12345` |
| `REDIS_USERNAME` | Redis username | `default` |
| `REDIS_PASSWORD` | Redis password | `your_redis_password` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `a-long-random-string` |
| `JWT_EXPIRES_IN` | JWT expiry duration | `7d` |
| `EMAIL_HOST` | SMTP host for Nodemailer | `smtp.ethereal.email` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP username / email address | `user@ethereal.email` |
| `EMAIL_PASS` | SMTP password | `your_email_password` |

### Frontend — `client/.env`

Create `client/.env` from `client/.env.example`:

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `VITE_EMAILJS_SERVICE_ID` | EmailJS service ID | `service_xxxxxxx` |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS template ID | `template_xxxxxxx` |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS public key | `xxxxxxxxxxxxxxxxxxxx` |

> **Contact form setup:** Create a free account at [emailjs.com](https://emailjs.com), add a Gmail service, and create a template with variables `from_name`, `from_email`, `subject`, `message`.

---

## 📖 API Documentation

Swagger UI is available at `/api/docs` when the backend is running.

```
Local:      http://localhost:5000/api/docs
```

**To authenticate in Swagger:**
1. Call `POST /api/auth/login` with your credentials
2. Copy the `token` from the response
3. Click **Authorize** at the top of the page and paste the token

Documented endpoints:

| Group | Endpoints |
|---|---|
| Auth | `POST /api/auth/register` · `POST /api/auth/login` |
| Jobs | `GET /api/jobs` · `POST /api/jobs` · `GET /api/jobs/:id` · `PUT /api/jobs/:id` · `DELETE /api/jobs/:id` · `PATCH /api/jobs/:id/submit` · `PATCH /api/jobs/:id/approve` · `GET /api/jobs/pending` · `GET /api/jobs/company/:id` |
| Companies | `GET /api/companies` · `POST /api/companies` · `GET /api/companies/:id` · `PUT /api/companies/:id` · `DELETE /api/companies/:id` |
| Applications | `POST /api/applications` · `GET /api/applications/my` · `GET /api/applications/job/:id` · `PATCH /api/applications/:id/status` |
| Users | `GET /api/users` |

---

## 🗄️ Database Schema

| Table | Description |
|---|---|
| `users` | Authentication, role, profile |
| `companies` | Employer company profiles |
| `jobs` | Job listings with status workflow (`draft → pending → active`) |
| `applications` | Applicant submissions with status tracking |
| `notifications` | Persistent notification history per user |

---

## 🚢 Deployment

### Backend — Railway

1. Push the repo to GitHub
2. Create a new Railway project and connect the repo
3. Set the **root directory** to `server/`
4. Add all environment variables from `server/.env.example` in Railway's dashboard
5. Set start command: `npm run start` (runs `node dist/server.js` after build)

### Frontend — Vercel

1. Connect the repo to Vercel
2. Set the **root directory** to `client/`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-railway-backend-url.railway.app/api
   ```
4. Deploy — Vercel auto-detects Vite and runs `tsc -b && vite build`

> **CORS:** The Railway backend URL must also be added to the `origin` array in `server/src/app.ts`.

---

## 📸 Screenshots

> Screenshots coming soon.

<!-- Add screenshots here once the UI is finalized -->

---

## 👨‍💻 Author

**Niamul** — [@NiamulNotizj](https://x.com/NiamulNotizj) · [github.com/niamul007](https://github.com/niamul007)

Building in public. Feedback welcome.
