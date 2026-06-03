
-- Enums
CREATE TYPE public.app_role AS ENUM ('driver','provider','admin');
CREATE TYPE public.job_status AS ENUM ('pending','assigned','enroute','arrived','in_progress','completed','cancelled');
CREATE TYPE public.provider_type AS ENUM ('mechanic','vulcanizer','tow','battery','fuel');

-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- user_roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role security definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- providers
CREATE TABLE public.providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  workshop text NOT NULL,
  type public.provider_type NOT NULL DEFAULT 'mechanic',
  avatar text,
  rating numeric(2,1) NOT NULL DEFAULT 4.8,
  verified boolean NOT NULL DEFAULT false,
  home_lat double precision NOT NULL,
  home_lng double precision NOT NULL,
  phone text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.providers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.providers TO authenticated;
GRANT ALL ON public.providers TO service_role;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

-- jobs
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES public.providers(id) ON DELETE SET NULL,
  status public.job_status NOT NULL DEFAULT 'pending',
  price numeric(10,2) NOT NULL DEFAULT 0,
  eta_min integer NOT NULL DEFAULT 0,
  pickup_lat double precision NOT NULL,
  pickup_lng double precision NOT NULL,
  dest_lat double precision,
  dest_lng double precision,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- provider_locations
CREATE TABLE public.provider_locations (
  provider_id uuid PRIMARY KEY REFERENCES public.providers(id) ON DELETE CASCADE,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  heading double precision,
  speed double precision,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.provider_locations TO anon, authenticated;
GRANT INSERT, UPDATE ON public.provider_locations TO authenticated;
GRANT ALL ON public.provider_locations TO service_role;
ALTER TABLE public.provider_locations ENABLE ROW LEVEL SECURITY;

-- analytics_events
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event text NOT NULL,
  props jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- profiles
CREATE POLICY "profiles self read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- user_roles
CREATE POLICY "roles self read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "roles admin write" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- providers
CREATE POLICY "providers public read" ON public.providers FOR SELECT TO anon, authenticated USING (active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "providers admin write" ON public.providers FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "providers admin update" ON public.providers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "providers admin delete" ON public.providers FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- jobs
CREATE POLICY "jobs driver read" ON public.jobs FOR SELECT TO authenticated USING (
  auth.uid() = driver_id
  OR EXISTS (SELECT 1 FROM public.providers p WHERE p.id = jobs.provider_id AND p.user_id = auth.uid())
  OR public.has_role(auth.uid(),'admin')
);
CREATE POLICY "jobs driver insert" ON public.jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = driver_id);
CREATE POLICY "jobs participants update" ON public.jobs FOR UPDATE TO authenticated USING (
  auth.uid() = driver_id
  OR EXISTS (SELECT 1 FROM public.providers p WHERE p.id = jobs.provider_id AND p.user_id = auth.uid())
  OR public.has_role(auth.uid(),'admin')
);

-- provider_locations
CREATE POLICY "loc public read" ON public.provider_locations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "loc provider write" ON public.provider_locations FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.providers p WHERE p.id = provider_id AND p.user_id = auth.uid())
);
CREATE POLICY "loc provider update" ON public.provider_locations FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.providers p WHERE p.id = provider_id AND p.user_id = auth.uid())
);

-- analytics
CREATE POLICY "analytics self insert" ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "analytics admin read" ON public.analytics_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Auto-create profile + default driver role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), COALESCE(NEW.raw_user_meta_data->>'phone',''));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'driver'::public.app_role))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Realtime
ALTER TABLE public.jobs REPLICA IDENTITY FULL;
ALTER TABLE public.provider_locations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.provider_locations;
