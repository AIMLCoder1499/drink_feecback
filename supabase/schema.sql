-- ============================================================
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Responses table
CREATE TABLE IF NOT EXISTS responses (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at        TIMESTAMPTZ DEFAULT now(),

  -- Phase 1: Identity
  name              TEXT        NOT NULL,
  contact           TEXT        NOT NULL,
  age               INTEGER,
  occupation        TEXT,
  city              TEXT,
  smokes            TEXT,         -- never | occasionally | regularly
  drinks            TEXT,         -- never | occasionally | regularly
  caffeine          TEXT,         -- none | 1cup | 2plus
  takes_supplements BOOLEAN,
  supplement_details TEXT,

  -- Phase 2: Effect
  felt_effect       TEXT,         -- yes | no | not_sure
  effect_onset      TEXT,         -- under10 | 10to20 | 20to30 | 30to45 | 45plus | nothing
  effect_descriptors TEXT[],
  effect_other_text TEXT,
  unwanted_effects  TEXT[],
  audio_url         TEXT,         -- Supabase Storage public URL

  -- Phase 3: Product
  taste_rating      INTEGER,
  aroma_rating      INTEGER,
  would_buy         TEXT,         -- yes | maybe | no
  price_point       TEXT,
  occasions         TEXT[],
  feedback_audio_url TEXT,
  open_to_followup  BOOLEAN
);

-- 2. Enable Row Level Security
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone (anonymous) to INSERT — no auth required
CREATE POLICY "allow_anon_insert" ON responses
  FOR INSERT TO anon WITH CHECK (true);

-- 4. Block public reads (only you can read via Supabase dashboard or service key)
-- No SELECT policy = anon cannot read rows.

-- ============================================================
-- STORAGE: run these steps in Supabase Dashboard → Storage
-- 1. Create a bucket called:  audio-recordings
-- 2. Set it to PUBLIC (so audio preview works in the form)
-- 3. Add this RLS policy on the bucket objects:
-- ============================================================

-- Storage INSERT policy (paste in Supabase Dashboard → Storage → Policies)
-- Bucket: audio-recordings | Operation: INSERT | Role: anon
-- Policy expression:
--   bucket_id = 'audio-recordings'
