-- Função que classifica automaticamente a tag_origem ao inserir um lead
CREATE OR REPLACE FUNCTION public.classify_lead_tag_origem()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_source text;
BEGIN
  -- Se foi marcado manualmente, respeita a escolha do usuário
  IF COALESCE(NEW.tag_origem_manual, false) = true THEN
    RETURN NEW;
  END IF;

  v_source := lower(COALESCE(NEW.utm_source, ''));

  -- Meta Ads: tem fbc, ctwa_clid, ou utm_source de plataformas Meta
  IF NEW.meta_fbc IS NOT NULL
     OR NEW.meta_ctwa_clid IS NOT NULL
     OR v_source IN ('facebook', 'instagram', 'fb', 'ig', 'meta')
     OR lower(COALESCE(NEW.utm_medium, '')) IN ('paid_social', 'paidsocial', 'cpc-meta')
  THEN
    NEW.tag_origem := 'meta_ads'::lead_tag_origem;

  -- Google Ads: utm_source google + utm_medium cpc, ou utm_source googleads
  ELSIF v_source IN ('google', 'googleads', 'google_ads', 'adwords')
        AND lower(COALESCE(NEW.utm_medium, '')) IN ('cpc', 'ppc', 'paid', 'paidsearch', 'paid_search')
  THEN
    NEW.tag_origem := 'google_ads'::lead_tag_origem;

  ELSIF v_source IN ('googleads', 'google_ads', 'adwords') THEN
    NEW.tag_origem := 'google_ads'::lead_tag_origem;

  -- Origem manual (criado dentro do CRM, sem tracking)
  ELSIF NEW.origem = 'manual'::lead_origem THEN
    NEW.tag_origem := 'novo'::lead_tag_origem;

  -- Tem qualquer UTM mas não bateu nas regras = orgânico/outro tráfego
  ELSIF NEW.utm_source IS NOT NULL OR NEW.referrer IS NOT NULL THEN
    NEW.tag_origem := 'organico'::lead_tag_origem;

  -- Default: veio do site sem rastreamento identificável
  ELSE
    NEW.tag_origem := 'site'::lead_tag_origem;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger BEFORE INSERT para classificar antes de gravar
DROP TRIGGER IF EXISTS classify_lead_tag_origem_trigger ON public.leads;
CREATE TRIGGER classify_lead_tag_origem_trigger
  BEFORE INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.classify_lead_tag_origem();

-- Trigger para registrar histórico (já existe a função log_lead_tag_origem_change)
DROP TRIGGER IF EXISTS log_lead_tag_origem_change_trigger ON public.leads;
CREATE TRIGGER log_lead_tag_origem_change_trigger
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.log_lead_tag_origem_change();