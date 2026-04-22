-- 1) Enum para tag_origem
DO $$ BEGIN
  CREATE TYPE public.lead_tag_origem AS ENUM ('novo', 'site', 'google_ads', 'meta_ads', 'organico');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Novas colunas em leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS tag_origem public.lead_tag_origem NOT NULL DEFAULT 'novo',
  ADD COLUMN IF NOT EXISTS plataforma_origem text,
  ADD COLUMN IF NOT EXISTS tag_origem_manual boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tag_origem_alterada_em timestamptz,
  ADD COLUMN IF NOT EXISTS tag_origem_alterada_por uuid,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS referrer text,
  ADD COLUMN IF NOT EXISTS landing_page text,
  ADD COLUMN IF NOT EXISTS meta_form_id text,
  ADD COLUMN IF NOT EXISTS meta_form_name text,
  ADD COLUMN IF NOT EXISTS meta_campaign_id text,
  ADD COLUMN IF NOT EXISTS meta_campaign_name text,
  ADD COLUMN IF NOT EXISTS meta_adset_id text,
  ADD COLUMN IF NOT EXISTS meta_adset_name text,
  ADD COLUMN IF NOT EXISTS meta_ad_id text,
  ADD COLUMN IF NOT EXISTS meta_ad_name text,
  ADD COLUMN IF NOT EXISTS meta_page_id text;

CREATE INDEX IF NOT EXISTS idx_leads_tag_origem ON public.leads (tag_origem);
CREATE INDEX IF NOT EXISTS idx_leads_utm_source ON public.leads (utm_source);
CREATE INDEX IF NOT EXISTS idx_leads_meta_campaign_id ON public.leads (meta_campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_meta_form_id ON public.leads (meta_form_id);

-- Backfill: leads existentes ficam como 'site' (já tinham origem='site') ou 'novo'
UPDATE public.leads SET tag_origem = 'site'::public.lead_tag_origem WHERE origem = 'site' AND tag_origem = 'novo';
UPDATE public.leads SET tag_origem = 'meta_ads'::public.lead_tag_origem WHERE origem = 'redes_sociais' AND tag_origem = 'novo';

-- 3) Tabela de subscrições do webhook Meta (uma por Page ID)
CREATE TABLE IF NOT EXISTS public.meta_webhook_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id text NOT NULL UNIQUE,
  page_name text,
  page_access_token text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.meta_webhook_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view meta subscriptions"
  ON public.meta_webhook_subscriptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert meta subscriptions"
  ON public.meta_webhook_subscriptions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update meta subscriptions"
  ON public.meta_webhook_subscriptions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete meta subscriptions"
  ON public.meta_webhook_subscriptions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_meta_webhook_subscriptions_updated_at
  BEFORE UPDATE ON public.meta_webhook_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Histórico de alterações de tag_origem
CREATE TABLE IF NOT EXISTS public.lead_origem_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  old_tag text,
  new_tag text NOT NULL,
  changed_by uuid,
  automatic boolean NOT NULL DEFAULT false,
  changed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_origem_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view origem history"
  ON public.lead_origem_history FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert origem history"
  ON public.lead_origem_history FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_lead_origem_history_lead_id ON public.lead_origem_history (lead_id);

-- 5) Trigger: registra alterações de tag_origem automaticamente
CREATE OR REPLACE FUNCTION public.log_lead_tag_origem_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.lead_origem_history (lead_id, old_tag, new_tag, changed_by, automatic)
    VALUES (NEW.id, NULL, NEW.tag_origem::text, NEW.tag_origem_alterada_por, NOT COALESCE(NEW.tag_origem_manual, false));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND NEW.tag_origem IS DISTINCT FROM OLD.tag_origem THEN
    INSERT INTO public.lead_origem_history (lead_id, old_tag, new_tag, changed_by, automatic)
    VALUES (NEW.id, OLD.tag_origem::text, NEW.tag_origem::text, NEW.tag_origem_alterada_por, NOT COALESCE(NEW.tag_origem_manual, false));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_lead_tag_origem_change ON public.leads;
CREATE TRIGGER trg_log_lead_tag_origem_change
  AFTER INSERT OR UPDATE OF tag_origem ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.log_lead_tag_origem_change();