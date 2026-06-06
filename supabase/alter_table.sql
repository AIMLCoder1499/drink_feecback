-- Run this in Supabase SQL Editor to add the new columns
-- Safe to run even if columns already exist (IF NOT EXISTS)

ALTER TABLE responses ADD COLUMN IF NOT EXISTS drink_type   TEXT;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS drink_detail TEXT;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS quantity     TEXT;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS current_state TEXT;
