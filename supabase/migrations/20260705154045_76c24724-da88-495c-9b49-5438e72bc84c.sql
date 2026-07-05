
-- 1. Tighten events RLS: drop permissive public write policies, require authenticated + ownership
DROP POLICY IF EXISTS "Anyone can insert events" ON public.events;
DROP POLICY IF EXISTS "Anyone can update events" ON public.events;
DROP POLICY IF EXISTS "Anyone can delete events" ON public.events;

CREATE POLICY "Authenticated users can insert their own events"
  ON public.events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners or admins can update events"
  ON public.events FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners or admins can delete events"
  ON public.events FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Drop legacy overpermissive storage policies for event-images
DROP POLICY IF EXISTS "Authenticated users can delete event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update event images" ON storage.objects;
DROP POLICY IF EXISTS "Event images update (authenticated)" ON storage.objects;
DROP POLICY IF EXISTS "Event images upload (authenticated)" ON storage.objects;

-- 3. Restrict bucket listing: drop duplicate broad SELECT policies.
--    Files remain accessible via the public bucket URL (which bypasses RLS),
--    but list() calls no longer enumerate the entire bucket.
DROP POLICY IF EXISTS "Anyone can view event images" ON storage.objects;
DROP POLICY IF EXISTS "Event images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Event images public read" ON storage.objects;

-- 4. Hide auth-only tables from the auto-generated GraphQL schema
COMMENT ON TABLE public.user_roles IS E'@graphql({"totalCount": {"enabled": false}, "skip_type": true})';
COMMENT ON TABLE public.event_registrations IS E'@graphql({"totalCount": {"enabled": false}, "skip_type": true})';
COMMENT ON TABLE public.profiles IS E'@graphql({"totalCount": {"enabled": false}, "skip_type": true})';
COMMENT ON TABLE public.events IS E'@graphql({"totalCount": {"enabled": false}, "skip_type": true})';

-- 5. Lock down SECURITY DEFINER functions from being called by API roles
--    has_role: convert to SECURITY INVOKER — user_roles RLS still lets
--    authenticated users read their own row, which is all this function needs.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

--    handle_new_user is a trigger — no need for API roles to call it directly.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
