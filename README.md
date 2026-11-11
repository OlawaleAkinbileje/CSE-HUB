# CSE Hub

CSE Hub is a web-based academic resource discovery and management platform for a
Computer Science and Engineering department. Students and visitors can search
approved course resources; staff manage submissions; administrators manage
users, categories, courses, settings, analytics, and support tickets.

## Technology

- **Frontend:** Next.js App Router, React, TypeScript, Tailwind CSS, TanStack
  Query, Axios
- **API:** FastAPI, Pydantic, SQLAlchemy, JWT
- **Data and files:** Supabase PostgreSQL and private Supabase Storage bucket
- **Roles:** `student`, `staff`, and `admin`

## Start locally

1. Install Node.js (20.9 or later), Python 3.11+, Docker Desktop, and the
   Supabase CLI.
2. Install frontend packages and start local Supabase from the repository root:

   ```powershell
   cd frontend
   npm ci
   cd ..
   supabase start
   supabase migration up --local
   ```

3. Copy `backend/.env.example` to `backend/.env`; set the local Supabase
   database URL, Supabase API URL, service-role key, and a development JWT
   secret. Keep this file private and out of Git.
4. Start the API:

   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\python.exe -m pip install -r requirements.txt
   .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

5. In another terminal, copy `frontend/.env.example` to `frontend/.env.local`,
   confirm the local API and Supabase URLs, then run:

   ```powershell
   cd frontend
   npm run dev
   ```

   Open `http://localhost:3000`. Apply new schema changes to production only
   after confirming the target project and reviewing the migration.

See [docs/PROJECT_GUIDE.md](./docs/PROJECT_GUIDE.md) for the architecture,
feature inventory, database model, workflows, deployment assessment, SEO, and
operational checklist.
