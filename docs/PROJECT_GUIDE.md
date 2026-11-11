# CSE Hub: Project and Operations Guide

**Review date:** 11 November 2026
**Purpose:** Single reference for the application, local development, data model,
workflows, deployment readiness, and search-engine optimization.

## 1. Product overview

CSE Hub is a department-focused resource search and administration platform.
Visitors can discover public, approved academic resources without an account.
Authenticated users can access role-specific functionality:

- **Student:** search and browse, view resources, bookmark, download, comment,
  manage personal resources, and submit support requests.
- **Staff:** upload and manage resources, review submissions, and access staff
  dashboards.
- **Administrator:** manage user roles and account status, categories and
  courses, view analytics, persist application preferences, and triage support
  tickets.

Self-registration and first-time OAuth provisioning create student accounts.
Staff and administrator access must be assigned by an existing administrator.
Guest support tickets can be submitted with a contact name and email.

## 2. System architecture

```text
Browser
  └── Next.js App Router frontend
        ├── Axios / TanStack Query ──> FastAPI /api/v1
        │                                ├── JWT authentication and role checks
        │                                ├── SQLAlchemy + PostgreSQL
        │                                └── Supabase Storage API
        └── Supabase browser client (OAuth sign-in)
```

- The frontend is in `frontend/`; FastAPI code is in `backend/app/`.
- The v1 route registry is `backend/app/api/v1/__init__.py`.
- JWT access tokens are stored in browser cookies and sent as Bearer tokens.
- The backend uses the integer-ID `public.users` table for application
  accounts. Resources, categories, courses, and storage are in Supabase's
  `public` schema.
- Uploaded files use the private `cse-hub-files` bucket. API access is mediated
  by the backend and its server-only service role key.
- Migrations are ordered SQL files in `supabase/migrations/`; seed data is in
  `supabase/seed.sql`.

## 3. Main application areas

### Public

- `/` — landing page and search entry point
- `/search` — public search, filters, and sort controls
- `/resources/[id]` — resource details, preview, downloads, comments, and
  authenticated save actions
- `/about`, `/knowledge`, `/projects`, `/past-questions`, `/code-preview`
- `/login`, `/register`, and `/auth/callback`
- `/support` — help content and persistent support request form

### Student

- `/student/dashboard`
- `/my-resources`
- `/profile`
- `/notifications`

### Staff

- `/staff/dashboard`
- `/staff/upload`
- `/staff/review-submissions`
- `/staff/manage-resources`
- `/staff/edit-resource-metadata`

### Administration

- `/admin/dashboard`
- `/admin/analytics`
- `/admin/users`
- `/admin/categories`
- `/admin/settings`
- `/admin/support` — support ticket queue and status management

Frontend middleware protects the staff and admin route groups. API authorization
is enforced separately by FastAPI dependencies; UI route protection must not be
treated as an API security boundary.

## 4. Important API groups

All routes are mounted under `/api/v1`.

- `/auth`: registration, password login, OAuth exchange, current profile
- `/resources`: public search and resource details, preview/download, upload,
  review, comments, bookmarks, user resources, resource options, and stats
- `/dashboard`: student, staff, and admin metrics
- `/admin`: protected user management, categories/courses, analytics, persisted
  settings, and ticket administration
- `/support/tickets`: public or authenticated ticket creation
- `/notifications`: authenticated notification list and read actions

The API schema at `/docs` (FastAPI Swagger UI) is useful for local inspection;
disable or restrict interactive API documentation in a public production
environment if that is the deployment policy.

## 5. Data and migrations

Core data entities include:

- `users`: application accounts, role, activation and verification flags
- `categories`, `courses`, `resources`: resource catalog and relationships
- `backend_downloads`, `backend_saved_resources`, `backend_comments`,
  `backend_notifications`: application workflows and activity
- `admin_settings`: JSON settings document (preferences; not all preferences
  are enforced by backend behavior)
- `support_tickets`: persisted user/guest requests and their statuses
- `backend_search_events`: search counts without retaining search terms

Migration history currently includes initial schema, application backend
workflows, Storage bucket setup, and admin/support workflows. The latest
admin/support migration was applied to the **local** Supabase stack during this
review. This does not apply it to any hosted database.

To apply pending migrations to local Supabase:

```powershell
supabase start
supabase migration up --local
```

For a hosted project, first link the intended Supabase project and inspect
pending migrations. Apply them only after confirming the project reference,
backup/restore plan, and intended environment. This repository is not currently
linked to a hosted Supabase project.

## 6. Local development

Prerequisites: Node.js 20.9+, Python 3.11+, Docker Desktop, and Supabase CLI.

1. Install frontend packages with `cd frontend; npm ci`.
2. Start local Supabase from the repository root and apply migrations.
3. Configure `backend/.env` from `backend/.env.example`. Obtain local-only
   Supabase values from the CLI; never commit them.
4. From `backend/`, create a virtual environment, install
   `requirements.txt`, and run `uvicorn app.main:app --reload --host 127.0.0.1
   --port 8000`.
5. Configure `frontend/.env.local` from `frontend/.env.example` and run
   `npm run dev` from `frontend/`.
6. Useful validation commands:

   ```powershell
   cd frontend
   npx.cmd tsc --noEmit
   npm.cmd run lint
   npm.cmd run build
   ```

The backend's dependencies are in `backend/requirements.txt`. At review time
there is no checked-in automated backend test suite; backend syntax and route
registration have been checked, but database integration tests are still
needed.

## 7. Configuration

### Frontend

- `NEXT_PUBLIC_API_URL`: deployed FastAPI base URL including `/api/v1`
- `NEXT_PUBLIC_SITE_URL`: canonical public website origin, e.g.
  `https://hub.example.edu` (must be set for production indexing metadata)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project API URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: publishable/anon key only; never put the
  service role key in a `NEXT_PUBLIC_*` variable

### Backend

- `DATABASE_URL`: PostgreSQL connection string
- `SUPABASE_URL`: Supabase project API URL
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key for storage and OAuth
- `SUPABASE_STORAGE_BUCKET`: `cse-hub-files`
- `SECRET_KEY`: unique, random JWT signing secret
- `ENVIRONMENT`: use `production` in the hosted API environment
- `CORS_ORIGINS`: comma-separated exact frontend origins, including scheme,
  with no wildcard (for example `https://hub.example.edu`)

Production API startup now fails if `ENVIRONMENT=production` but
`CORS_ORIGINS` is empty or the placeholder JWT secret is still configured.

## 8. Current workflow/data coverage

### Connected to persistent data

- Authentication accounts and roles
- Resource catalog, review state, uploads, downloads, comments, and bookmarks
- About-page counts and role-aware navigation
- Admin user role/status changes
- Category/course create, edit, archive/restore
- Admin settings save/load
- Analytics based on resource, user, and download records
- Support ticket create and admin status updates
- Dashboard counts, latest resources/submissions, user-role distribution, and
  six-month resource additions

### Known scope limits

- Support requests are persisted, but no email delivery or attachment storage
  is configured. The UI states that email notifications are unavailable.
- Backup schedule/retention values are stored as settings only. There is no
  backup provider, backup execution, or backup history workflow.
- Search uses the PostgreSQL full-text index; no manual reindex job is exposed.
- Session visits/active-user events are not collected. Analytics therefore
  reports active account flags and download activity, not true sessions or
  daily active users.
- Dashboard search counts record event totals but not query terms.
- Last-active timestamps and student/staff ID numbers are not tracked in the
  application user schema.
- Some settings are preferences rather than enforced policies (for example
  maintenance mode, email/notification delivery, file-threat scanning,
  allowed domains, and session timeout).
- Support submissions are not rate-limited or protected by CAPTCHA. Add abuse
  controls before opening the public form to significant traffic.

## 9. Deployment readiness

**Assessment: suitable for a controlled staging deployment; not ready for
unqualified production launch yet.** The frontend production build and
TypeScript checks passed, and the backend imports and exposes its routes against
the current local configuration. A live hosted database/API integration test
has not been performed.

### Required before production

1. Choose and link the exact hosted Supabase project; inspect and apply the
   pending migration there, with an appropriate backup/restore procedure.
2. Deploy the FastAPI service and set all backend secrets, `ENVIRONMENT`,
   `CORS_ORIGINS`, and database/storage configuration in the hosting platform.
3. Set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, and Supabase public
   configuration for the production frontend.
4. Configure production email verification and confirm the authoritative
   student email domains. Registration currently validates email syntax but
   does not verify ownership or enforce an institutional domain.
5. Decide how staff/admin accounts are provisioned and verify admin bootstrap,
   account suspension, and role changes on the hosted database.
6. Add backend tests for role authorization, account registration, SQL-backed
   workflows, and database migrations; add an end-to-end staging smoke test.
7. Configure transactional email (support ticket acknowledgement/alerts),
   backups, monitoring/log retention, and public support-form abuse protection
   if those are launch requirements.
8. Review browser-cookie security and the threat model. The current frontend
   reads its JWT from JavaScript-accessible cookies; production XSS prevention,
   secure cookie attributes, HTTPS, and token/session lifecycle need a deliberate
   security review.
9. Review and enable Row Level Security (RLS) with table-specific policies for
   the Supabase-exposed public schema. A local Supabase security check reported
   RLS disabled on 16 public tables. The latest migration revokes `anon` and
   `authenticated` privileges on the newly introduced settings, support ticket,
   and search event tables, but this does not remediate the other exposed
   tables. Do not enable RLS without designing policies: it may block expected
   access. The database/API authorization model needs a table-by-table review.
10. Run a production deployment build and smoke-test login, role boundaries,
   search, upload/download, support tickets, and admin actions using test data.

Do not treat the values in the admin settings screen as proof that maintenance
mode, email, backups, indexing, or threat scanning are active services.

## 10. SEO baseline and next steps

Implemented in the frontend:

- Descriptive global title/description, keywords, Open Graph and Twitter card
  metadata
- Page-level metadata and canonical URLs for About, Search, and resource pages
- `robots.txt` and `sitemap.xml` metadata routes
- Production indexing is disabled until `NEXT_PUBLIC_SITE_URL` is configured;
  authenticated and account pages are excluded from crawling

Recommended before launch:

1. Configure the final HTTPS domain in `NEXT_PUBLIC_SITE_URL`; verify
   `https://<domain>/robots.txt` and `/sitemap.xml` after deployment.
2. Add a branded Open Graph image (1200x630), favicon/app icons, and real
   department-specific title/description copy.
3. Generate sitemap entries for approved resource details from the public API;
   the current sitemap contains only stable public routes.
4. Server-render resource title/description metadata and use canonical URLs;
   current resource details are client-rendered, limiting crawler-visible
   resource-level metadata.
5. Add structured data where accurate (Organization/EducationalOrganization,
   BreadcrumbList, and resource-specific CreativeWork metadata).
6. Submit the production sitemap to Google Search Console and Bing Webmaster
   Tools; monitor indexing, canonical selection, and crawl errors.
7. Keep authenticated/student/staff/admin/support pages out of search results,
   and ensure the backend never returns private or unapproved resources to
   public callers.
8. Measure Core Web Vitals and optimize hero images, fonts, and client-side
   bundles. Add analytics only with an appropriate privacy notice and consent
   approach.

SEO cannot compensate for thin or client-only content. Resource discoverability
will improve most after public resource pages expose unique, server-rendered
titles, descriptions, course/category context, and useful text content.

## 11. Project directory map

```text
backend/
  app/api/v1/       FastAPI route groups
  app/core/         application settings and security
  app/db/           SQLAlchemy engine/session
  app/models/       SQLAlchemy models
  app/services/     storage and shared services
frontend/
  src/app/          Next.js routes and metadata
  src/components/   shared UI and navigation
  src/lib/          API client, hooks, and query functions
supabase/
  migrations/       ordered PostgreSQL/Supabase migrations
  seed.sql          local category/course seed data
docs/
  PROJECT_GUIDE.md  this system and deployment guide
```
