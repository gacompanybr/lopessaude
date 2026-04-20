-- 1) Tipo de perfil
DO $$ BEGIN
  CREATE TYPE public.profile_category AS ENUM ('administrador', 'atendente', 'comercial', 'gerente', 'outro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.profile_types
  ADD COLUMN IF NOT EXISTS type public.profile_category NOT NULL DEFAULT 'outro';

-- 2) Vínculo usuário <-> perfil customizado
CREATE TABLE IF NOT EXISTS public.user_profile_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  profile_type_id uuid NOT NULL REFERENCES public.profile_types(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profile_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can view assignments" ON public.user_profile_assignments;
CREATE POLICY "Authenticated can view assignments"
ON public.user_profile_assignments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert assignments" ON public.user_profile_assignments;
CREATE POLICY "Admins can insert assignments"
ON public.user_profile_assignments FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update assignments" ON public.user_profile_assignments;
CREATE POLICY "Admins can update assignments"
ON public.user_profile_assignments FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete assignments" ON public.user_profile_assignments;
CREATE POLICY "Admins can delete assignments"
ON public.user_profile_assignments FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS upd_user_profile_assignments ON public.user_profile_assignments;
CREATE TRIGGER upd_user_profile_assignments
BEFORE UPDATE ON public.user_profile_assignments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();