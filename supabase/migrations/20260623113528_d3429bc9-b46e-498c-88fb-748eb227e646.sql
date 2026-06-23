
-- has_role: switch to SECURITY INVOKER (always queried with auth.uid(), and user_roles self-select policy allows reading own rows)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY INVOKER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- touch_updated_at: invoker is fine, but lock down EXECUTE
ALTER FUNCTION public.touch_updated_at() SECURITY INVOKER;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- handle_new_user: must remain SECURITY DEFINER (writes profiles + user_roles from auth trigger), but lock down EXECUTE
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Storage policies: anyone can read; only authenticated users can write to their own folder (folder = auth.uid())
-- Read (all three buckets)
CREATE POLICY "buckets_public_read" ON storage.objects FOR SELECT
  USING (bucket_id IN ('showroom-assets','inventory-images','media-feed'));
-- Authenticated users write within their own folder
CREATE POLICY "buckets_owner_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('showroom-assets','inventory-images','media-feed')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "buckets_owner_update" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('showroom-assets','inventory-images','media-feed')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "buckets_owner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id IN ('showroom-assets','inventory-images','media-feed')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
