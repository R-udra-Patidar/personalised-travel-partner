# 🌍 Personalized Travel Itinerary Planner

A full-stack, AI-powered web application that generates personalized day-by-day travel itineraries based on user preferences, budget, travel style, and interests.

Built as a **Skill Wallet Capstone Project**.

---

## ✨ Features

- **AI-Powered Itinerary Generation** — Day-by-day schedules using Google Gemini
- **Destination Recommendations** — Top 3 destinations suggested based on preferences
- **Preference Collection** — Vibe, budget, pace, interests, travelers, dates
- **Route Optimization** — Geographic clustering of nearby attractions
- **Budget Estimation** — Itemized cost estimates per category
- **Edit & Regenerate** — Replace activities or regenerate individual days
- **Trip Persistence** — Save, view, and manage trips via Supabase
- **PDF Export** — Download full travel guides as PDFs
- **Demo Mode** — Works without AI API key using deterministic fallback

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, React Router |
| Backend | Python, FastAPI, Pydantic, HTTPX |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini API (`google-generativeai`) |
| PDF | ReportLab |
| Deployment | Frontend → Render, Backend → Vercel |

---

## 📁 Project Structure

```
personalized-travel-planner/
├── frontend/              # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-level page components
│   │   ├── layouts/       # Layout wrappers
│   │   ├── services/      # API calls to backend
│   │   ├── hooks/         # Custom React hooks
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── public/
│   ├── package.json
│   └── .env.example
├── backend/               # FastAPI Python backend
│   ├── app/
│   │   ├── main.py        # Application entry point
│   │   ├── api/           # Route handlers
│   │   ├── core/          # Config, logging, security
│   │   ├── models/        # Data models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic (AI, PDF, geo)
│   │   ├── database/      # Supabase client & operations
│   │   └── utils/         # Helper utilities
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── supabase/
│   └── migrations/        # SQL schema migrations
├── docs/
│   ├── PROJECT_PROGRESS.md
│   └── ACTIVITY_LOG.md
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- A Supabase account and project
- A Google Gemini API key (or run in demo mode without one)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/personalized-travel-planner.git
cd personalized-travel-planner
```

### 2. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your backend URL
npm run dev
```

The frontend will be available at `http://localhost:5173`  
The backend API will be available at `http://localhost:8000`

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Config
DEMO_MODE=false          # Set to true to use fallback data without AI key
CORS_ORIGINS=http://localhost:5173
```

### Frontend (`frontend/.env.local`)

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🗄 Database Schema

See [`supabase/migrations/`](./supabase/migrations/) for full SQL schema.

Key tables:
- `trips` — Trip metadata and preferences
- `itinerary_days` — Day-level itinerary data
- `activities` — Individual activity entries
- `budget_estimates` — Itemized cost breakdowns

---

## 📄 API Documentation

Once the backend is running, interactive API docs are available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 🧪 Running Tests

```bash
# Backend tests
cd backend
source venv/bin/activate
pytest tests/ -v

# Frontend type checking
cd frontend
npm run type-check
```

---

## 🌐 Deployment

| Service | Platform |
|---------|---------|
| Frontend | [Render](https://render.com) |
| Backend | [Vercel](https://vercel.com) |

See [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for step-by-step deployment instructions.

---

## 📋 Skill Wallet Progress

See [`docs/PROJECT_PROGRESS.md`](./docs/PROJECT_PROGRESS.md) for the full activity-by-activity implementation checklist.

---

## 🔒 Security Notes

- Never commit `.env` files — they are in `.gitignore`
- Supabase service-role keys are **backend-only** — never exposed to the browser
- All AI responses are validated before storage or display
- User inputs are validated via Pydantic on the backend

---

## 📝 License

MIT License — see [LICENSE](./LICENSE) for details.

---

*Built with ❤️ for the Skill Wallet Capstone Program*
