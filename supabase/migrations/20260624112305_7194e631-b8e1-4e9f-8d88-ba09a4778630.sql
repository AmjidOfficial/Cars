
-- 1) Tighten leads insert policy (no more WITH CHECK (true))
DROP POLICY IF EXISTS leads_insert_anyone ON public.leads;
CREATE POLICY leads_insert_scoped ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    target_showroom_id IS NOT NULL
    OR target_inventory_id IS NOT NULL
    OR intent IN ('concierge'::lead_intent, 'callback'::lead_intent)
  );

-- 2) Allow super_admin to SELECT profiles
CREATE POLICY profiles_super_admin_select ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- 3) Explicit user_roles management: super_admin only, cannot drop own super_admin
CREATE POLICY user_roles_super_admin_select ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY user_roles_super_admin_insert ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY user_roles_super_admin_update ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY user_roles_super_admin_delete ON public.user_roles
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin'::app_role)
    AND NOT (user_id = auth.uid() AND role = 'super_admin'::app_role)
  );
