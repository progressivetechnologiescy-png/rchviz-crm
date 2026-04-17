-- Supabase Security Fixes for ArchViz CRM
-- These commands will resolve the "RLS Disabled" and "Sensitive Columns Exposed" warnings.
-- Since this project uses a custom Node.js backend with Prisma (which connects as a superuser), 
-- these changes will NOT break your existing application while fully securing the Data API.

-- 1. Enable Row Level Security (RLS) on all public tables
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

-- 2. Revoke sensitive column access from default Data API roles (anon and authenticated)
-- This specific query resolves "Sensitive Columns Exposed public.User" for the password field
REVOKE SELECT ON TABLE "public"."User" FROM "anon", "authenticated";
REVOKE SELECT ("password") ON "public"."User" FROM "public";

-- Note: Because no RLS policies are created, the Supabase Data API (PostgREST) will be fully locked down.
-- Your Node/Prisma backend will continue to work perfectly because Prisma connects via
-- the DATABASE_URL which uses the 'postgres' role (bypassing RLS automatically).
