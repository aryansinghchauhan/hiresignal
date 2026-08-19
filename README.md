# HireSignal — AI-Powered Job Market Intelligence Platform

> Upload your resume. Find out exactly which skills you're missing for your target role — based on real job postings analyzed with NLP and ML.

![HireSignal Dashboard](https://img.shields.io/badge/Status-Active-brightgreen) ![Node.js](https://img.shields.io/badge/Node.js-v24-green) ![Python](https://img.shields.io/badge/Python-3.13-blue) ![React](https://img.shields.io/badge/React-18-61DAFB) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)

---

## What it does

Most job seekers apply blindly without knowing which skills are actually in demand. HireSignal fixes that by:

1. **Scraping real job postings** from the web using Puppeteer
2. **Extracting skills** from every job description using spaCy NLP with a custom 150+ skill dictionary
3. **Ranking skills by role** using TF-IDF (skills distinctive to a role rank higher than generic ones)
4. **Clustering similar jobs** using K-Means to discover natural groupings across role categories
5. **Analyzing your resume** — upload a PDF and get a match score + ranked list of missing skills for your target role

---

## Demo

### Dashboard — Top Skills by Role
The dashboard shows real-time skill demand across 6 role categories (backend, frontend, fullstack, ML, data, DevOps). Click any role to see a bar chart of the top 10 most in-demand skills extracted from real job descriptions.

### Gap Analysis
Upload your resume PDF, select your target role, and get:
- **Match score** (0–100%) — how well your skills align with the role
- **Missing skills** — ranked by how often they appear in job postings
- **Skills you already have** — confirmed matches against the top-20 role skills
- **All skills found** in your resume

---

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   React Frontend │────▶│  Node.js/Express API  │────▶│  PostgreSQL DB  │
│   (port 3000)   │     │     (port 5000)        │     │  (Docker:5432)  │
└─────────────────┘     └──────────┬───────────┘     └─────────────────┘
                                   │
                                   ▼
                         ┌──────────────────────┐
                         │  Python Flask NLP     │
                         │  Service (port 8000)  │
                         │  spaCy + scikit-learn │
                         └──────────────────────┘
```

**Three independent services:**
- **Frontend** — React + Recharts dashboard, Vite dev server
- **Backend** — Node.js/Express REST API, Puppeteer scraper, JWT auth, cron scheduler
- **NLP Service** — Python Flask, spaCy NER, TF-IDF, K-Means clustering, PDF parsing

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Recharts, React Router, Axios |
| Backend | Node.js, Express, PostgreSQL, Redis, JWT, Bcrypt |
| ML/NLP | Python, spaCy, scikit-learn (TF-IDF, K-Means), pdfplumber |
| Scraping | Puppeteer, node-cron |
| Database | PostgreSQL 15 (Docker), pgvector-ready schema |
| Auth | JWT (7-day tokens), bcrypt password hashing |
| DevOps | Docker, Docker Compose ready |

---

## ML Pipeline Explained

### Skill Extraction (spaCy NER)
Raw job description text → spaCy `en_core_web_sm` model + custom `EntityRuler` with 150+ tech skill patterns → extracted skill list. Two-method approach: EntityRuler for exact matches, substring fallback for partial matches.

### TF-IDF Skill Ranking
Standard frequency counting (Redis appears in 12/17 backend jobs) doesn't tell you if Redis is *distinctive* for backend. TF-IDF does — it penalises skills that appear across many roles (Docker, AWS) and rewards skills unique to a role (Spring Boot for backend, Terraform for devops).

### K-Means Job Clustering
All 49 jobs are vectorized using TF-IDF on their skill sets, normalized, then clustered into k=6 groups. The algorithm discovers natural groupings without being told the role categories — frontend jobs cluster together because they share React/TypeScript/Redux, backend jobs share Redis/Node.js/PostgreSQL, etc.

### Resume Gap Analysis
1. PDF text extracted using pdfplumber
2. Same spaCy pipeline extracts skills from resume text
3. Top-20 skills for target role fetched from DB (ranked by job frequency)
4. Set intersection → matching skills; set difference → missing skills
5. Match score = `(matching / total_role_skills) * 100`

---

## Database Schema

```sql
users              -- auth: id, name, email, password, created_at
jobs               -- scraped JDs: id, title, company, description, url, role_category
job_skills         -- extracted skills: job_id → skill (many-to-many)
role_skill_rankings -- TF-IDF output: role_category, skill, score, rank
skill_trends       -- weekly snapshots: role, skill, job_count, week_start
gap_analysis_history -- user history: user_id, target_role, missing_skills, match_score
```

---

## API Reference

### Auth
```
POST /api/auth/register    { name, email, password } → { token, user }
POST /api/auth/login       { email, password } → { token, user }
GET  /api/auth/me          [Bearer token] → { user }
```

### Jobs
```
GET  /api/jobs             ?role=backend&limit=20 → { jobs }
GET  /api/jobs/count       → { counts: [{ role_category, count }] }
POST /api/jobs/seed        → seeds 49 hardcoded jobs
POST /api/jobs/scrape      → triggers live Puppeteer scrape (background)
```

### Skills
```
GET  /api/skills/trending  ?role=backend&limit=15 → { skills }
GET  /api/skills/all-roles → { roles: { backend: [...], frontend: [...] } }
POST /api/skills/process   → batch extracts skills from all unprocessed jobs
```

### ML
```
POST /api/ml/tfidf         → computes TF-IDF rankings for all roles
POST /api/ml/cluster       → runs K-Means clustering on all jobs
GET  /api/ml/rankings      ?role=backend → { rankings }
```

### Gap Analysis
```
POST /api/gap/analyze      [multipart: resume PDF + target_role] → { match_score, missing_skills, ... }
GET  /api/gap/history      [Bearer token] → { history }
```

### NLP Service (Python, port 8000)
```
POST /extract-skills       { text, role_category } → { skills, count }
POST /extract-resume       [multipart: PDF file] → { skills, count }
POST /batch-extract        { jobs: [...] } → { results }
POST /tfidf-rankings       { jobs: [...] } → { rankings }
POST /cluster-jobs         { jobs: [...] } → { clusters, job_clusters }
```

---

## Project Structure

```
hiresignal/
├── backend/
│   ├── src/
│   │   ├── index.js               # Express server + cron scheduler
│   │   ├── db/
│   │   │   ├── connection.js      # PostgreSQL pool
│   │   │   └── migrate.js         # Schema migrations
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── jobs.js
│   │   │   ├── skills.js
│   │   │   ├── ml.js
│   │   │   └── gap.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── jobsController.js
│   │   │   ├── skillsController.js
│   │   │   ├── mlController.js
│   │   │   └── gapController.js
│   │   ├── middleware/
│   │   │   └── authenticate.js    # JWT middleware
│   │   └── services/
│   │       ├── scraper.js         # Puppeteer scraper
│   │       ├── seedJobs.js        # 49 hardcoded jobs
│   │       ├── nlpService.js      # Node → Python bridge
│   │       └── fixSuggester.js
│   └── package.json
│
├── nlp/
│   ├── app.py                     # Flask API
│   ├── skills.py                  # 150+ tech skill dictionary
│   └── venv/
│
└── frontend/
    ├── src/
    │   ├── App.jsx                # Routes
    │   ├── api.js                 # Axios instance + auth interceptor
    │   ├── components/
    │   │   └── Navbar.jsx
    │   └── pages/
    │       ├── Dashboard.jsx      # Skill charts
    │       ├── GapAnalysis.jsx    # Resume upload + results
    │       ├── Login.jsx
    │       └── Register.jsx
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- Python 3.10+
- Docker Desktop

### 1. Clone the repo
```bash
git clone https://github.com/aryansinghchauhan/hiresignal.git
cd hiresignal
```

### 2. Start PostgreSQL
```bash
docker run -d --name hiresignal-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_DB=hiresignal \
  -p 5432:5432 postgres:15-alpine
```

### 3. Set up the backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run migrate        # creates all 6 tables
npm run dev            # starts on port 5000
```

### 4. Seed + process data
```bash
curl -X POST http://localhost:5000/api/jobs/seed
curl -X POST http://localhost:5000/api/skills/process
curl -X POST http://localhost:5000/api/ml/tfidf
```

### 5. Set up the Python NLP service
```bash
cd ../nlp
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install flask spacy scikit-learn pandas numpy pdfplumber python-dotenv flask-cors
python -m spacy download en_core_web_sm
python app.py                # starts on port 8000
```

### 6. Start the frontend
```bash
cd ../frontend
npm install
npm run dev                  # starts on port 3000
```

Open `http://localhost:3000`

---

## Environment Variables

**backend/.env**
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hiresignal
DB_USER=postgres
DB_PASSWORD=postgres123
JWT_SECRET=your_secret_key
NLP_SERVICE_URL=http://localhost:8000
SAMPLE_RATE=1.0
```

---

## Key Design Decisions

**Why two backends (Node + Python)?**
Node.js is better for API serving, file handling, and async I/O. Python has the mature ML ecosystem (spaCy, scikit-learn). Separating them lets each do what it's best at — Node handles HTTP, Python handles NLP/ML.

**Why TF-IDF over simple frequency count?**
Frequency count makes Docker rank #1 for every role since it appears everywhere. TF-IDF surfaces role-specific skills — Terraform for DevOps, PyTorch for ML, Spring Boot for backend — which is far more actionable for a job seeker.

**Why K-Means with k=6?**
The dataset has 6 natural role categories. K-Means with k=6 learns these groupings purely from skill co-occurrence patterns, with no role labels during training. The resulting clusters validate the NLP extraction quality — if the model groups correctly, the skills are being extracted correctly.

**Why JWT over sessions?**
Stateless auth scales horizontally without a session store. The 7-day expiry balances UX (users stay logged in) with security.

---

## What I'd add next

- **Skill trend charts** — line chart showing which skills grew fastest in the last 30 days
- **Company hiring heatmap** — which companies are actively hiring for your target role
- **Resume rewrite suggestions** — not just missing skills, but specific bullet point rewrites
- **Real-time scraping** — replace seed data with live Naukri/LinkedIn scraping

---

## Author

**Aryan Singh Chauhan**
B.Tech ECE, NIT Jamshedpur
[GitHub](https://github.com/aryansinghchauhan) · [LinkedIn](https://linkedin.com/in/aryansinghchauhan)
