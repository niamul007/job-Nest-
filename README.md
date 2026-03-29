# JobNest 🪺

> Where careers are built.

A production-grade **Job Board REST API** built with Node.js, TypeScript, and PostgreSQL. JobNest connects employers, applicants, and admins through a clean, scalable backend architecture — designed to reflect real-world hiring platforms like We Work Remotely and Remotive.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Cache | Redis |
| Auth | JWT + RBAC |
| Testing | Jest |
| Queue | Bull |
| Real-time | WebSockets |
| Container | Docker + Docker Compose |
| Deployment | Render |

---

## 👥 Roles & Permissions

| Role | Permissions |
|---|---|
| `admin` | Approve/reject jobs, manage users, platform overview |
| `employer` | Post jobs, manage listings, review applications |
| `applicant` | Browse jobs, apply, track application status |

---

## ✨ Core Features

- 🔐 JWT Authentication with Role-Based Access Control (RBAC)
- 📋 Job listings with filters — category, type, salary, location
- 📨 Application system with status tracking
- ⚡ Real-time notifications via WebSockets
- 📬 Background email notifications via Bull queue
- 🧠 Redis caching for job listings and rate limiting
- 🧪 Unit and integration tests with Jest
- 🐳 Fully containerized with Docker Compose

---

## 🗂️ Database Schema

- `users` — authentication and role management
- `companies` — employer profiles
- `jobs` — listings with status and metadata
- `applications` — applicant submissions with status tracking
- `notifications` — persistent notification history

---

## 📁 Project Structure

```
jobnest/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── prisma/
│   └── schema.prisma
├── tests/
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## 📌 Project Status

🟡 **In Progress** — Active development started March 2026

---

## 👨‍💻 Author

**Niamul** — [@NiamulNotizj](https://x.com/NiamulNotizj)

Backend developer in progress. Building in public.
