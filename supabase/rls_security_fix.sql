-- ============================================================
-- HLJ DEV - RLS Security Audit Fix
-- Applied: 2026-04-29
-- ============================================================

-- ── 1. REMOVE the over-permissive anonymous SELECT on leads ──
-- This policy lets anyone read ALL leads data (names, emails, phones)
-- without authentication. This must be removed.
DROP POLICY IF EXISTS "Public Select on leads" ON public.leads;

-- ── 2. TIGHTEN anon INSERT on leads ──────────────────────────
-- Re-create the insert policy for anon explicitly limited
-- to only inserting (not reading/updating/deleting).
DROP POLICY IF EXISTS "Public Insert on leads" ON public.leads;
CREATE POLICY "Anon Insert on leads"
  ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- ── 3. ENSURE admin (authenticated) has full access ──────────
-- Already exists but let's be explicit and safe
DROP POLICY IF EXISTS "Admin All Access on leads" ON public.leads;
CREATE POLICY "Admin Full Access on leads"
  ON public.leads
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── 4. TIGHTEN campanhas_maps ────────────────────────────────
-- Should only be accessible by authenticated admins
SELECT policyname FROM pg_policies WHERE tablename = 'campanhas_maps';

-- ── 5. VERIFY final state ────────────────────────────────────
SELECT tablename, policyname, cmd, roles, qual
FROM pg_policies
WHERE tablename = 'leads'
ORDER BY cmd;
