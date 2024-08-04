CREATE UNIQUE INDEX "User_username_insensitive_idx" ON "User" (lower("username"))

--
-- NOTE ON PRUNING:
--
-- We ONLY prune to keep the database small and efficient.
-- All records which would be pruned are already unused by
-- the program and may even be deleted by the program itself.
--
-- This is ONLY for speed and size reasons.
-- Nothing will break if these jobs are not run.
--

CREATE EXTENSION pg_cron

-- Users who have not made any progress toward finishing registration in the last 60 minutes are pruned
-- We check every 6 hours, though, because this isn't that important.
SELECT cron.schedule (
    'Prune Records: User',
    '0 */6 * * *',
    $$DELETE FROM "User" WHERE "pruneAt" IS NOT NULL and "pruneAt" < NOW()$$
);

-- Sessions are invalidated 32 hours after last use
-- We check to prune every 4 hours to keep the database small
SELECT cron.schedule (
    'Prune Records: AuthSession',
    '0 */4 * * *',
    $$DELETE FROM "AuthSession" WHERE "pruneAt" < NOW()$$
);


-- Keypair Requests are invalidated just 30 minutes after creation
--    and deleted once they're used
-- We check every 10 minutes because it's basically free
SELECT cron.schedule (
    'Prune Records: NewKeypairRequest',
    '*/10 * * * *',
    $$DELETE FROM "NewKeypairRequest" WHERE "pruneAt" < NOW()$$
);
