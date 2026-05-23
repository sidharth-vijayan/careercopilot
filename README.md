<div align="center">

# 👨🏻‍💻 CareerCopilot

### AI-Powered Career Intelligence Platform

**Parse resumes · Analyze job descriptions · Generate tailored applications · Track applications — all in one place.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google)](https://deepmind.google/technologies/gemini/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Deployment](https://img.shields.io/badge/Vercel-Deploying%20Soon-000000?style=flat-square&logo=vercel)](https://vercel.com/)

</div>

---

## 📌 Overview

**CareerCopilot** is a full-stack, AI-augmented career assistant that helps job seekers work smarter — not harder. It parses resumes, dissects job descriptions, and uses Google Gemini to generate personalized application materials tailored to each role.

The project integrates modern web technologies — a Next.js 16 frontend, Supabase-backed authentication and database layer, Prisma ORM, and a Gemini-powered AI pipeline — demonstrating end-to-end full-stack development skills with real-world AI integration.

> 🚧 **Status:** Feature-complete · Vercel deployment in final stage

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **Resume Parsing** | Upload PDF or DOCX resumes; extract structured data using `pdf-parse` and `mammoth` |
| 🔍 **JD Analysis** | Paste any job description and get key skill, role, and requirement breakdowns |
| 🤖 **AI Cover Letter Generation** | Google Gemini generates tailored cover letters matching resume to JD |
| 📊 **Match Score & Analytics** | Visual charts (Recharts) showing how well a resume aligns to a given role |
| 📁 **Application Tracker** | Track job applications by status (applied / interviewing / offered / rejected) |
| 📤 **PDF Export** | Export AI-generated documents as polished PDFs via `jspdf` |
| 🔐 **Secure Auth** | Supabase SSR-compatible authentication with session management |
| 🌙 **Dark Mode** | Full light/dark theme support via `next-themes` |

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router) with **React 19**
- **TypeScript 5** — fully typed codebase
- **Tailwind CSS v4** + **shadcn/ui** — component library
- **Framer Motion** — page transitions and micro-animations
- **Recharts** — data visualization for match analytics
- **Zustand** — lightweight global state management
- **React Hook Form + Zod** — form validation with schema enforcement

### Backend & Database
- **Supabase** — PostgreSQL database + authentication (SSR-compatible)
- **Prisma ORM** — type-safe database client and migrations

### AI / ML
- **Google Gemini (`@google/genai`)** — LLM backbone for cover letter generation, JD parsing, resume feedback

### Document Processing
- **`pdf-parse`** — extract text from uploaded PDF resumes
- **`mammoth`** — parse DOCX files to structured content
- **`jspdf`** — generate and export polished PDF documents
- **`@napi-rs/canvas`** — server-side canvas rendering

### Dev Tooling
- **ESLint** (Next.js config) — code quality enforcement
- **PostCSS** — CSS processing pipeline

---

## 📁 Project Structure

```
careercopilot/
├── prisma/                  # Database schema and migrations
│   └── schema.prisma
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router pages and layouts
│   ├── components/          # Reusable UI components (shadcn/ui + custom)
│   ├── lib/                 # Utility functions, Supabase client, AI helpers
│   └── store/               # Zustand global state
├── .gitignore
├── components.json          # shadcn/ui config
├── next.config.ts
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 18`
- A [Supabase](https://supabase.com/) project (free tier works)
- A [Google AI Studio](https://aistudio.google.com/) API key for Gemini

### 1. Clone the Repository

```bash
git clone https://github.com/sidharth-vijayan/careercopilot.git
cd careercopilot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Database (Supabase Postgres connection string)
DATABASE_URL=your_supabase_postgres_url
```

### 4. Set Up the Database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment

CareerCopilot is built to deploy on **Vercel** — Vercel deployment is currently in its final stage.

Once live, the deployment link will be added here.

**To deploy your own instance:**
1. Push the repo to GitHub
2. Import into [Vercel](https://vercel.com/new)
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Deploy

---

## 🔮 Future Scope

| Planned Enhancement | Description |
|---|---|
| 🐳 **Dockerization** | Containerize the full app for consistent local dev and self-hosting |
| ⚙️ **CI/CD Pipeline** | GitHub Actions workflows for lint, build checks, and auto-deploy on push to `main` |
| 🔔 **Job Alert Notifications** | Email/push notifications for application status changes |
| 🧠 **Resume Improvement Suggestions** | AI-powered resume feedback and bullet-point rewrites |
| 📊 **Analytics Dashboard** | Visual insights into application history and success rates |
| 🔗 **LinkedIn / Job Board Integration** | Scrape or import JDs directly from LinkedIn, Naukri, etc. |
| 🧪 **Testing Suite** | Unit and integration tests with Jest + Testing Library |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) standard for commit messages.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<div align="center">

Built by [Sidharth Vijayan](https://github.com/sidharth-vijayan)

⭐ If you find this project useful, consider giving it a star!

</div>
