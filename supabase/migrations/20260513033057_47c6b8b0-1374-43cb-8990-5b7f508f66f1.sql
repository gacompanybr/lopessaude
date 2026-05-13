
-- 1) username em profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_unique
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL;

-- 2) Função pública para resolver username -> email (necessária para login por usuário,
-- pois o usuário ainda não está autenticado e o RLS de profiles não permite leitura anônima).
CREATE OR REPLACE FUNCTION public.get_email_by_username(_username text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email
  FROM public.profiles
  WHERE lower(username) = lower(_username)
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.get_email_by_username(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_email_by_username(text) TO anon, authenticated;
