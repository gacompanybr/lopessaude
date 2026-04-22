-- 1) Adiciona campo gclid (Google Click ID)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS gclid text;
CREATE INDEX IF NOT EXISTS idx_leads_gclid ON public.leads(gclid) WHERE gclid IS NOT NULL;

-- 2) Atualiza função de classificação automática da tag de origem
CREATE OR REPLACE FUNCTION public.classify_lead_tag_origem()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_source text;
  v_medium text;
  v_referrer text;
  v_has_strong_paid_id boolean;
BEGIN
  v_source := lower(COALESCE(NEW.utm_source, ''));
  v_medium := lower(COALESCE(NEW.utm_medium, ''));
  v_referrer := lower(COALESCE(NEW.referrer, ''));

  -- Identificadores fortes de mídia paga: gclid, fbc ou ctwa_clid
  v_has_strong_paid_id := (
    NEW.gclid IS NOT NULL
    OR NEW.meta_fbc IS NOT NULL
    OR NEW.meta_ctwa_clid IS NOT NULL
  );

  -- Se há ID forte de pago, SEMPRE sobrescreve (mesmo manual)
  -- Se não há ID forte e foi marcado manualmente, respeita a escolha do usuário
  IF NOT v_has_strong_paid_id AND COALESCE(NEW.tag_origem_manual, false) = true THEN
    RETURN NEW;
  END IF;

  -- === META ADS ===
  -- Tem fbc, ctwa_clid, ou utm_source de plataformas Meta
  IF NEW.meta_fbc IS NOT NULL
     OR NEW.meta_ctwa_clid IS NOT NULL
     OR v_source IN ('facebook', 'instagram', 'fb', 'ig', 'meta')
     OR v_medium IN ('paid_social', 'paidsocial', 'cpc-meta')
     OR (v_referrer LIKE '%facebook.com%' AND NEW.utm_source IS NOT NULL)
     OR (v_referrer LIKE '%instagram.com%' AND NEW.utm_source IS NOT NULL)
  THEN
    NEW.tag_origem := 'meta_ads'::lead_tag_origem;
    NEW.tag_origem_manual := false;

  -- === GOOGLE ADS ===
  -- gclid presente, ou utm_source google + utm_medium pago, ou utm_source googleads/adwords
  ELSIF NEW.gclid IS NOT NULL
        OR (v_source IN ('google', 'googleads', 'google_ads', 'adwords')
            AND v_medium IN ('cpc', 'ppc', 'paid', 'paidsearch', 'paid_search'))
        OR v_source IN ('googleads', 'google_ads', 'adwords')
  THEN
    NEW.tag_origem := 'google_ads'::lead_tag_origem;
    NEW.tag_origem_manual := false;

  -- === MANUAL (criado dentro do CRM, sem tracking algum) ===
  ELSIF NEW.origem = 'manual'::lead_origem
        AND NEW.utm_source IS NULL
        AND NEW.referrer IS NULL
  THEN
    NEW.tag_origem := 'novo'::lead_tag_origem;

  -- === ORGÂNICO ===
  -- Tem referrer de mecanismo de busca, ou tem UTM mas não é paga
  ELSIF v_referrer LIKE '%google.%'
        OR v_referrer LIKE '%bing.com%'
        OR v_referrer LIKE '%duckduckgo.com%'
        OR v_referrer LIKE '%yahoo.com%'
        OR v_medium IN ('organic', 'organico', 'seo', 'referral', 'social')
        OR (NEW.utm_source IS NOT NULL OR NEW.referrer IS NOT NULL)
  THEN
    NEW.tag_origem := 'organico'::lead_tag_origem;

  -- === SITE (formulário sem rastreamento identificável) ===
  ELSE
    NEW.tag_origem := 'site'::lead_tag_origem;
  END IF;

  RETURN NEW;
END;
$function$;

-- 3) Garante que o trigger existe (idempotente)
DROP TRIGGER IF EXISTS trg_classify_lead_tag_origem ON public.leads;
CREATE TRIGGER trg_classify_lead_tag_origem
  BEFORE INSERT OR UPDATE OF utm_source, utm_medium, utm_campaign, referrer, meta_fbc, meta_ctwa_clid, gclid, origem
  ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.classify_lead_tag_origem();

-- 4) Atualiza função pública para também aceitar gclid
CREATE OR REPLACE FUNCTION public.create_public_lead(
  _name text DEFAULT NULL,
  _whatsapp text DEFAULT NULL,
  _city text DEFAULT NULL,
  _message text DEFAULT NULL,
  _status public.lead_status DEFAULT 'novo',
  _origem public.lead_origem DEFAULT 'site',
  _notes text DEFAULT NULL,
  _email text DEFAULT NULL,
  _state text DEFAULT NULL,
  _meta_fbc text DEFAULT NULL,
  _meta_fbp text DEFAULT NULL,
  _meta_ctwa_clid text DEFAULT NULL,
  _utm_source text DEFAULT NULL,
  _utm_medium text DEFAULT NULL,
  _utm_campaign text DEFAULT NULL,
  _utm_content text DEFAULT NULL,
  _utm_term text DEFAULT NULL,
  _referrer text DEFAULT NULL,
  _landing_page text DEFAULT NULL,
  _gclid text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NULLIF(BTRIM(COALESCE(_whatsapp, '')), '') IS NULL THEN
    RAISE EXCEPTION 'whatsapp is required';
  END IF;

  IF NULLIF(BTRIM(COALESCE(_city, '')), '') IS NULL THEN
    RAISE EXCEPTION 'city is required';
  END IF;

  INSERT INTO public.leads (
    name, whatsapp, city, message, status, origem, notes, email, state,
    meta_fbc, meta_fbp, meta_ctwa_clid,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    referrer, landing_page, gclid
  ) VALUES (
    _name, _whatsapp, _city, _message, _status, _origem, _notes, _email, _state,
    _meta_fbc, _meta_fbp, _meta_ctwa_clid,
    _utm_source, _utm_medium, _utm_campaign, _utm_content, _utm_term,
    _referrer, _landing_page, _gclid
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_public_lead(
  text, text, text, text, public.lead_status, public.lead_origem, text, text, text,
  text, text, text, text, text, text, text, text, text, text, text
) TO anon, authenticated;