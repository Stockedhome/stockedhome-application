CREATE UNIQUE INDEX "User_username_insensitive_idx" ON "User" (lower("username"));


-- Copied from the Supabase docs:
-- https://supabase.com/docs/guides/database/extensions/pg_cron?queryGroups=database-method&database-method=sql
create extension pg_cron with schema extensions;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

