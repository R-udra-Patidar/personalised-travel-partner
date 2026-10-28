# 🚀 Deployment Guide
## Personalized Travel Itinerary Planner — Skill Wallet Capstone

This project is architected for easy, modern cloud deployment using **Render**, **Vercel**, or any container/PaaS platform.

---

## 🏗️ Architecture Overview

```
[ Frontend: React + Vite (Static Site) ]
               │
               ▼  HTTPS / REST JSON
[ Backend: FastAPI Web Service (Python 3.9+) ]
         │                    │
         ▼                    ▼
[ Google Gemini AI ]    [ Supabase PostgreSQL DB ]
 (Fallback to Demo)       (Fallback to In-Memory)
```

---

## ⚡ Option 1: One-Click Deploy on Render (Recommended)

The repository includes a ready-to-use [`render.yaml`](../render.yaml) blueprint configuring both the backend API and frontend static site.

### Steps:
1. **Push repository to GitHub**: Ensure your latest code is on GitHub.
2. **Log in to [Render](https://render.com/)**:
   * Navigate to **Blueprints** → **New Blueprint Instance**.
   * Connect your GitHub repository.
3. **Configure Environment Variables**:
   * Under `travel-planner-api`, provide:
     * `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API Key. If omitted, the backend will smoothly fall back to high-fidelity Demo Mode.
     * `SUPABASE_URL`: *(Optional)* Your Supabase project URL.
     * `SUPABASE_SERVICE_ROLE_KEY`: *(Optional)* Your Supabase service role key.
4. **Deploy**:
   * Click **Apply**.
   * Render will automatically install dependencies, run `npm run build`, and deploy both services with HTTPS.

---

## ⚡ Option 2: Split Deploy (Vercel Frontend + Render Backend)

### Part A: Deploy Backend on Render
1. Go to **Render Dashboard** → **New Web Service**.
2. Select your repository.
3. Settings:
   * **Root Directory**: `backend`
   * **Environment**: `Python 3`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   * **Health Check Path**: `/health`
4. Set Environment Variables:
   * `APP_ENV`: `production`
   * `CORS_ORIGINS`: `https://your-frontend.vercel.app,http://localhost:5173`
   * `GEMINI_API_KEY`: `your_key_here`
   * `SUPABASE_URL`: `https://xxx.supabase.co`
   * `SUPABASE_SERVICE_ROLE_KEY`: `your_key_here`
5. Note your backend URL: e.g. `https://travel-planner-api.onrender.com`.

### Part B: Deploy Frontend on Vercel
1. Go to **[Vercel](https://vercel.com/)** → **Add New Project**.
2. Select repository, set **Root Directory** to `frontend`.
3. Set Environment Variable:
   * `VITE_API_BASE_URL`: `https://travel-planner-api.onrender.com`
4. Click **Deploy**.
   * The included [`frontend/vercel.json`](../frontend/vercel.json) handles client-side routing rewrites automatically.

---

## 🔑 Environment Variables Reference

| Variable | Service | Required? | Description | Default |
|---|---|---|---|---|
| `GEMINI_API_KEY` | Backend | Optional | Google Gemini API key for live AI generation | `""` (Falls back to Demo mode) |
| `SUPABASE_URL` | Backend | Optional | Supabase PostgreSQL project URL | `""` (Falls back to In-Memory storage) |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | Optional | Supabase admin secret key | `""` |
| `CORS_ORIGINS` | Backend | Optional | Comma-separated allowed frontend origins | `http://localhost:5173` |
| `APP_ENV` | Backend | Optional | `development` or `production` | `development` |
| `VITE_API_BASE_URL` | Frontend | Optional | URL of backend API | `http://localhost:8000` |

---

## 🗄️ Supabase Database Migration Checklist

If connecting a real Supabase database:
1. Open the [Supabase Dashboard](https://supabase.com).
2. Go to **SQL Editor**.
3. Copy and run the schema file [`supabase/migrations/001_initial_schema.sql`](../supabase/migrations/001_initial_schema.sql).
4. Verify the 4 tables are created:
   * `trips`
   * `itinerary_days`
   * `activities`
   * `budget_estimates`
5. Obtain the API credentials from **Project Settings → API** and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

---

## 🩺 Post-Deployment Health Check Verification

Once deployed, verify the backend health check endpoint:
```bash
curl https://your-backend-url.onrender.com/health
```

Expected JSON response:
```json
{
  "status": "ok",
  "app": "Personalized Travel Itinerary Planner",
  "version": "1.0.0",
  "environment": "production",
  "ai_enabled": true,
  "supabase_configured": true
}
```
