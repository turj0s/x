
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can insert events" ON public.events;

CREATE POLICY "Anyone can update events" ON public.events FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete events" ON public.events FOR DELETE USING (true);
CREATE POLICY "Anyone can insert events" ON public.events FOR INSERT WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
