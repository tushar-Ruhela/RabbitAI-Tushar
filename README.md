<div align="center">

# 📊 RabbitAI: Sales Insight Automator

**AI-powered sales data analysis with executive summary delivery & interactive Q&A**

[![CI Pipeline](https://github.com/tushar-Ruhela/rabbitai-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/tushar-Ruhela/rabbitai-agent/actions)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Gemini](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-blue?logo=google-gemini)](https://ai.google.dev)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma)](https://prisma.io)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://docker.com)

### [🚀 Live Demo: rabbitai-tushar.vercel.app](https://rabbitai-tushar.vercel.app/)

Upload → AI Analysis → Anomaly Tagging → Email → ✅

</div>

---

## 🏗️ Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                          Next.js (App Router)                     │
│    ┌──────────────────┐             ┌────────────────────────┐    │
│    │  Frontend  │             │   Next.js API Routes   │    │
│    │ (Framer Motion)  │────────────▶│    (Edge/Serverless)   │    │
│    └──────────────────┘             └───────────┬────────────┘    │
│              ▲                                  │                 │
│              │          ┌───────────────────────┼─────────────────┤
│              │          │                       ▼                 │
│              │    ┌─────┴─────┐           ┌───────────┐     ┌─────┴─────┐
│              └────┤ PDF/Export│           │ Prisma ORM│     │ Resend API│
│                   └───────────┘           └─────┬─────┘     └───────────┘
│                                                 ▼                 │
└─────────────────────────────────────────── PostgreSQL DB ─────────┘
```

### Data Flow

1. **Upload** – User uploads `.csv`/`.xlsx` via the high-contrast upload widget.
2. **Detection** – System triggers concurrent LLM chains for summary generation and **Anomaly Tagging**.
3. **Storage** – Job status and parsed insights are persisted in PostgreSQL via **Prisma**.
4. **Delivery** – The executive brief is dispatched instantly via the **Resend** mailer.
5. **Interactive Q&A** – Users use "Ask Rabbit" to chat with their specific dataset context.
6. **Reporting** – Completed jobs can be exported as high-fidelity **PDFs** locally.

---

## 📂 Project Structure

```
rabbitai-agent/
│
├── app/                        # Next.js 15 (App Router)
│   ├── api/                    # Serverless API Endpoints
│   │   ├── jobs/               # Job CRUD & Batch operations
│   │   ├── upload/             # File parsing & AI trigger
│   │   ├── chat/               # "Ask Rabbit" LLM Q&A
│   │   └── swagger/            # OpenAPI spec generation
│   ├── dashboard/              # Insights & Monitoring UI
│   ├── upload/                 # Real-time processing feedback
│   └── docs/                   # Live Swagger UI
│
├── lib/                        # Shared Services
│   ├── services/
│   │   ├── llm.ts              # Gemini 1.5 Flash Integration
│   │   ├── mailer.ts           # Resend Email Integration
│   │   └── dataParser.ts       # CSV/XLSX Node parsers
│   └── prisma.ts               # Database client
│
├── prisma/                     # Database Schema & Migrations
│   ├── schema.prisma           # Unified data model (Job, ChatMessage)
│   └── migrations/             # History of DB changes
│
├── components/                 # Shadcn/UI + Custom Components
├── public/                     # Static assets
├── Dockerfile                  # Multi-stage production build
├── docker-compose.yml          # Full-stack local orchestration
├── .github/workflows/          # CI Pipeline (Build, Lint, Validate)
├── .env.example                # Environment template
└── README.md                   # The Engineer's Log
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20
- **Docker & Docker Compose**
- API keys for [Google Gemini](https://aistudio.google.com/) and [Resend](https://resend.com)

### 1. Clone & Configure

```bash
git clone https://github.com/tushar-Ruhela/rabbitai-agent.git
cd rabbitai-agent

# Setup local environment
cp .env.example .env
# Open .env and add your GEMINI_API_KEY and RESEND_API_KEY
```

### 2. Run with Docker (Recommended)

```bash
docker-compose up -d --build
npx prisma db push # Sync the schema to the containerized DB
```

| Service   | Local URL                    | Live Production URL              |
|-----------|------------------------------|----------------------------------|
| Frontend  | http://localhost:3000        | [Link](https://rabbitai-tushar.vercel.app/) |
| Dashboard | http://localhost:3000/dashboard | [Link](https://rabbitai-tushar.vercel.app/dashboard) |
| API Docs  | http://localhost:3000/docs      | [Link](https://rabbitai-tushar.vercel.app/docs) |

---

## 📡 API Documentation

Interactive Swagger docs are available locally at `/docs`.

| Endpoint             | Method | Description                                |
|----------------------|--------|--------------------------------------------|
| `/api/jobs`          | GET    | Fetch all sales analysis records           |
| `/api/jobs`          | POST   | Create analysis job placeholder            |
| `/api/jobs/{id}/upload`| POST   | Upload file & trigger AI Anomaly detection |
| `/api/jobs/{id}/chat`  | POST   | "Ask Rabbit" - Chat with specific dataset  |
| `/api/jobs/{id}/email` | POST   | Forward report to additional recipients    |

---

## 🔐 Security & Design Decisions

| Layer               | Implementation                                         |
|---------------------|--------------------------------------------------------|
| **Endpoint Security**| UUID-based job tracking + Sanitized Prisma queries     |
| **Input Safety**    | Strict type-checking via TypeScript & Pydantic-like models|
| **Isolation**       | PDF generation strictly strips classes to avoid lab() CSS leaks |
| **UX Aesthetic**    | **Aesthetic**: High-contrast, premium flat design |
| **Micro-interactions**| Framer Motion for physical press & smooth transitions |
| **Reliability**     | Resilient background processing with progress tracking  |

---

## 📝 Engineer's Log — Design Choices

### Why Gemini 1.5 Flash?
Offers a massive context window (ideal for large sales datasets) with extreme speed. It generates high-fidelity summaries and detects anomalies far more accurately than legacy models.

### The "Ask Rabbit" Engine
Instead of a static summary, we implemented a context-aware chat. The system retrieves the job's summary and specific data insights to answer granular questions (e.g., *"Why did Home Appliances dip in March?"*).

### UI Redesign
The interface was transformed from generic "Glassmorphism" to a **Premium Style**:
- Stark light-theme by default.
- Thick 2px-4px borders and hard 4px shadows.
- Bold, high-contrast typography using Inter.

### PDF Export Strategy
Implemented client-side PDF generation using `html2pdf.js`. To ensure robustness, we use an isolation bridge that strips app CSS to prevent modern color space browser bugs (`lab()` colors) from breaking the doc.

---

## 🚢 Deployment Guide (Vercel + Render)

1. **Database:** Deploy a PostgreSQL instance on Render or Supabase and set `DATABASE_URL`.
2. **Backend/Frontend:** Import repo to Vercel.
3. **Environment:** Add `GEMINI_API_KEY`, `RESEND_API_KEY`, and `NEXT_PUBLIC_APP_URL`.
4. **Build:** Use `npm run build`.
5. **Live:** Live instance: [rabbitai-tushar.vercel.app](https://rabbitai-tushar.vercel.app/)

---

<div align="center">

Made with ❤️ by **Tushar Ruhela** (2311981546) • **Chitkara University**

</div>
