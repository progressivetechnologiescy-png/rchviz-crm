-- PostgreSQL / Supabase Schema Update
-- Applies user status and reset token fields securely without dropping data

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP(3);
