# Terpene Feedback — Field Research Form

A mobile-first feedback form for house party consumer research on your functional drink.  
Stack: **React + Vite → Netlify** / **Supabase** (PostgreSQL + Storage for audio blobs).

---

## 1. Supabase Setup (one-time, ~10 min)

### 1.1 Create project
1. Go to [supabase.com](https://supabase.com) → New project
2. Note your **Project URL** and **anon public key** (Settings → API)

### 1.2 Run the schema
1. Supabase Dashboard → **SQL Editor** → New query
2. Paste the contents of `supabase/schema.sql` → Run

### 1.3 Create the Storage bucket
1. Supabase Dashboard → **Storage** → New bucket
2. Name it exactly: `audio-recordings`
3. Set it to **Public** (respondents need to play back their recording preview)
4. Under **Policies** → add an INSERT policy for the `anon` role:
   - Allowed operation: INSERT
   - Target roles: `anon`
   - Policy expression: `bucket_id = 'audio-recordings'`

---

## 2. Local Development

```bash
git clone <your-repo>
cd terpene-feedback
npm install

# Set up env
cp .env.example .env
# Edit .env — add your Supabase URL and anon key

npm run dev
# → http://localhost:5173
```

---

## 3. Deploy to Netlify

### Option A — Netlify UI (easiest)
1. Push repo to GitHub
2. Netlify → New site → Import from GitHub → pick repo
3. Build command: `npm run build` / Publish dir: `dist`
4. **Site settings → Environment variables** — add:
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
5. Deploy

### Option B — Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set VITE_SUPABASE_URL https://xxx.supabase.co
netlify env:set VITE_SUPABASE_ANON_KEY eyJxx...
netlify deploy --prod
```

---

## 4. Generate Your QR Code

Once deployed, your URL will be something like `https://your-project.netlify.app`.

Use any QR generator (e.g. [qr-code-generator.com](https://www.qr-code-generator.com)):
- Print one per party — A5 or A6 card is fine
- Laminate if reusing across multiple parties

---

## 5. Viewing Responses

**Supabase Dashboard → Table Editor → responses table**

To export all responses as CSV:
- Table Editor → `responses` → top-right menu → **Download CSV**

Audio files live in **Storage → audio-recordings** bucket.  
Each response row has `audio_url` and `feedback_audio_url` columns linking directly to the files.

---

## 6. Customisation

| What to change | Where |
|---|---|
| Brand name (currently `BOTANICA`) | `src/App.jsx` → `const BRAND` |
| Intro copy | `src/App.jsx` → the `step === 0` JSX block |
| Questions / options | Each `src/steps/Step*.jsx` file |
| Colours / fonts | `src/index.css` → `:root` variables + font imports in `index.html` |

---

## 7. Architecture

```
Browser (React form)
    │
    ├── Text data  → supabase.from('responses').insert(...)
    └── Audio blobs → supabase.storage.from('audio-recordings').upload(...)
                         → returns public URL stored in responses.audio_url
```

No backend server. Everything runs client-side via the Supabase JS client.  
The anon key is safe to expose — Supabase RLS policies ensure anon users can only INSERT, not read.
