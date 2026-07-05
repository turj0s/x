
-- 1. Prevent NULL created_by on any new/updated event without deleting legacy
--    seed rows that don't have an owner. NOT VALID skips the historical check.
ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_created_by_not_null_chk;

ALTER TABLE public.events
  ADD CONSTRAINT events_created_by_not_null_chk
  CHECK (created_by IS NOT NULL) NOT VALID;

-- 2. Block GraphQL discovery for anon and authenticated (PostgREST unaffected).
REVOKE USAGE ON SCHEMA graphql FROM anon, authenticated, public;
REVOKE ALL ON ALL TABLES IN SCHEMA graphql FROM anon, authenticated, public;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA graphql FROM anon, authenticated, public;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA graphql FROM anon, authenticated, public;

ALTER DEFAULT PRIVILEGES IN SCHEMA graphql REVOKE ALL ON TABLES FROM anon, authenticated, public;
ALTER DEFAULT PRIVILEGES IN SCHEMA graphql REVOKE ALL ON FUNCTIONS FROM anon, authenticated, public;
