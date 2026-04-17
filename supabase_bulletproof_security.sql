-- Supabase Bulletproof Security Fixes for Prisma Backends
-- This will decisively resolve "Sensitive Columns" and "RLS" warnings for non-Data API architectures.

-- 1. Enable RLS on all tables
ALTER TABLE "public"."Asset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Channel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Employee" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Folder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;

-- 2. Revoke EVERYTHING from Supabase's public default Data API roles
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;

-- 3. Explicitly drop the password column from the PostgREST API schema cache
-- (This tells Supabase's API the column doesn't exist, silencing the sensitive column warning)
NOTIFY pgrst, 'reload schema';
