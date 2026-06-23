
-- Enums
CREATE TYPE public.app_role AS ENUM ('super_admin', 'showroom_admin', 'visitor');
CREATE TYPE public.inventory_status AS ENUM ('available', 'reserved', 'sold');
CREATE TYPE public.media_type AS ENUM ('image', 'video');
CREATE TYPE public.lead_intent AS ENUM ('callback', 'whatsapp', 'view_details', 'concierge', 'inventory_view');

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  mobile_number TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_self_select" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- showrooms
CREATE TABLE public.showrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  city TEXT,
  whatsapp_number TEXT,
  call_number TEXT,
  theme_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_flagship BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.showrooms TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.showrooms TO authenticated;
GRANT ALL ON public.showrooms TO service_role;
ALTER TABLE public.showrooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "showrooms_public_select" ON public.showrooms FOR SELECT USING (is_active = true);
CREATE POLICY "showrooms_owner_all" ON public.showrooms FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

-- inventory
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  showroom_id UUID NOT NULL REFERENCES public.showrooms(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  title TEXT NOT NULL,
  model_year INTEGER,
  mileage_km INTEGER,
  fuel_type TEXT,
  transmission TEXT,
  price_pkr BIGINT,
  price_formatted TEXT,
  description TEXT,
  images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  is_premium BOOLEAN NOT NULL DEFAULT false,
  status public.inventory_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.inventory TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory TO authenticated;
GRANT ALL ON public.inventory TO service_role;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inventory_public_select" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "inventory_owner_write" ON public.inventory FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.showrooms s WHERE s.id = showroom_id AND (s.owner_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.showrooms s WHERE s.id = showroom_id AND (s.owner_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'))));

-- media_posts
CREATE TABLE public.media_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  showroom_id UUID NOT NULL REFERENCES public.showrooms(id) ON DELETE CASCADE,
  caption TEXT,
  media_url TEXT NOT NULL,
  media_type public.media_type NOT NULL DEFAULT 'image',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_posts TO authenticated;
GRANT ALL ON public.media_posts TO service_role;
ALTER TABLE public.media_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media_public_select" ON public.media_posts FOR SELECT USING (true);
CREATE POLICY "media_owner_write" ON public.media_posts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.showrooms s WHERE s.id = showroom_id AND (s.owner_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.showrooms s WHERE s.id = showroom_id AND (s.owner_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'))));

-- leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_mobile TEXT,
  visitor_name TEXT,
  intent public.lead_intent NOT NULL,
  notes TEXT,
  target_showroom_id UUID REFERENCES public.showrooms(id) ON DELETE SET NULL,
  target_inventory_id UUID REFERENCES public.inventory(id) ON DELETE SET NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
-- Anyone (including anon) can insert a lead (telemetry)
CREATE POLICY "leads_insert_anyone" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Super admins read everything
CREATE POLICY "leads_super_admin_select" ON public.leads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));
-- Showroom owners read leads tied to their showroom
CREATE POLICY "leads_owner_select" ON public.leads FOR SELECT TO authenticated
  USING (
    target_showroom_id IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.showrooms s WHERE s.id = target_showroom_id AND s.owner_id = auth.uid())
  );

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER showrooms_touch BEFORE UPDATE ON public.showrooms FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER inventory_touch BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Auto-create profile + visitor role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_mobile TEXT;
BEGIN
  v_mobile := COALESCE(NEW.raw_user_meta_data->>'mobile_number', NEW.phone, NEW.email);
  INSERT INTO public.profiles (id, mobile_number, display_name)
    VALUES (NEW.id, v_mobile, COALESCE(NEW.raw_user_meta_data->>'display_name', v_mobile))
    ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'visitor')
    ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helpful indexes
CREATE INDEX idx_inventory_showroom ON public.inventory(showroom_id);
CREATE INDEX idx_inventory_brand ON public.inventory(brand);
CREATE INDEX idx_media_showroom ON public.media_posts(showroom_id, created_at DESC);
CREATE INDEX idx_leads_showroom ON public.leads(target_showroom_id, created_at DESC);
CREATE INDEX idx_leads_created ON public.leads(created_at DESC);
