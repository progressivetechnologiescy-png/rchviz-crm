-- Supabase Performance Fixes for ArchViz CRM
-- This command resolves the "Unindexed foreign keys" warning for public.Project

-- Create an index on the clientId foreign key to speed up JOINs and DELETEs against the Client table.
CREATE INDEX IF NOT EXISTS "Project_clientId_idx" ON "public"."Project" ("clientId");
