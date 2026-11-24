# CSE Hub backend

FastAPI provides the application API and JWT authentication. PostgreSQL and file
storage are provided by Supabase.

## Local setup

1. Start Docker Desktop.
2. From the repository root, start the local Supabase stack and apply pending
   migrations:

   ```bash
   npx supabase start
   npx supabase migration up --local
   ```

   Migrations keep the database schema aligned, publish existing resources that
   were waiting for review, and configure the private `cse-hub-files` Storage
   bucket. New staff uploads are published immediately. This project configures
   Studio on port `54326`, the Supabase API on `54322`, and PostgreSQL on
   `54332`.
3. Configure `backend/.env` with:
   - `DATABASE_URL` pointing to the Supabase PostgreSQL database
   - `SUPABASE_URL` set to `http://127.0.0.1:54322` for local development
   - `SUPABASE_STORAGE_BUCKET=cse-hub-files`
   - `SUPABASE_SERVICE_ROLE_KEY` set to the local server-side service role
     secret printed by the Supabase CLI
   - `RESEND_API_KEY` set to a Resend API key
   - `EMAIL_FROM` set to a sender on a domain verified in Resend, for example
     `CSE Hub <no-reply@mail.example.com>`
   - `FRONTEND_URL` set to the web app origin, such as
     `http://localhost:3000` locally or the deployed frontend URL in production

   Never use a publishable/anon key as `SUPABASE_SERVICE_ROLE_KEY`, and never
   expose the service role key in frontend variables.
   Keep `RESEND_API_KEY` server-side as well. Resend's `onboarding@resend.dev`
   sender is intended for testing and is restricted to the account owner's
   recipient address; verify a sending domain in Resend before sending to
   student or staff addresses.
4. Start FastAPI from this directory. In Git Bash, the existing virtual
   environment can be activated and the server started with:

   ```bash
   source venv/Scripts/activate
   export DISABLE_SQLALCHEMY_CEXT=1
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

   The SQLAlchemy environment variable is only needed on Windows machines where
   Application Control blocks SQLAlchemy's compiled extension.

## Email verification

After applying `20261124110000_email_verification_resend.sql`, new registrations
receive a single-use verification link that expires after 24 hours. Login and
authenticated API access require a verified email. Users can request another
link at `/verify-email`; email changes from the profile also require confirmation.
Set the Resend variables above in Render's backend environment before enabling
registration in production.

## Copying older local uploads

Older versions of the upload endpoint could save files under `backend/uploads`
when Supabase Storage was not configured. After setting the valid local service
role secret and applying the bucket migration, run this from `backend/` in the
same activated virtual environment:

```bash
python scripts/migrate_local_uploads_to_supabase.py
```

The script copies files referenced by resource records into Supabase Storage
using their existing storage keys. It leaves local files untouched.
