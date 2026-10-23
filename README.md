# RelxPrep AI

Exam preparation platform: React (Vite) frontend, Express backend, Supabase (Postgres + Auth) database, Groq for AI features.

## Project layout

- `client/`  React + Vite + Tailwind frontend (deploy to Vercel)
- `server/`  Express API (deploy to Render, see `render.yaml`)
- `supabase/schema.sql`  database tables, RLS policies, signup trigger

## 1. Database (Supabase)

1. Create a Supabase project.
2. Open SQL Editor, paste `supabase/schema.sql`, run it once.
3. From Project Settings -> API copy: Project URL, anon key, service_role key.

## 2. Backend

```bash
cd server
cp .env.example .env     # fill in the values
npm install
npm start
```

Check it:

- `GET /api/health`     server is up
- `GET /api/health/db`  Supabase connection works (returns `connected`)

Deploy: create a Render Blueprint from this repo (uses `render.yaml`) and set the env vars from `server/.env.example`.
Set `NODE_ENV=production` and `CORS_ORIGIN` to your Vercel URL.

## 3. Frontend

```bash
cd client
cp .env.example .env     # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
npm install
npm run dev
```

Deploy on Vercel (root `vercel.json` already builds `client/`). In Vercel -> Settings -> Environment Variables add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` = your Render backend URL (no trailing slash)

Then redeploy, because Vite bakes these values in at build time.

## Keeping the database connection healthy

- Use the `service_role` key only on the backend; the frontend only ever gets the anon key.
- Monitor `GET /api/health/db` with an uptime checker (UptimeRobot etc.). This also stops free-tier hosts from sleeping.
- Supabase free projects pause after about a week of inactivity, so resume from the dashboard if `/api/health/db` reports `unreachable`.
