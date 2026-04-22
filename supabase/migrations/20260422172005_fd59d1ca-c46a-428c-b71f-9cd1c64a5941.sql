
-- 1. Adicionar campos técnicos da Meta na tabela leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS meta_lead_id TEXT,
  ADD COLUMN IF NOT EXISTS meta_fbc TEXT,
  ADD COLUMN IF NOT EXISTS meta_fbp TEXT,
  ADD COLUMN IF NOT EXISTS meta_ctwa_clid TEXT,
  ADD COLUMN IF NOT EXISTS sincronizado_meta BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ultimo_status_enviado_meta TEXT,
  ADD COLUMN IF NOT EXISTS ultimo_envio_meta_em TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS ultimo_retorno_meta JSONB,
  ADD COLUMN IF NOT EXISTS ultimo_erro_meta TEXT;

-- 2. Tabela de histórico de mudança de status
CREATE TABLE IF NOT EXISTS public.lead_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_status_history_lead_id ON public.lead_status_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_status_history_changed_at ON public.lead_status_history(changed_at DESC);

ALTER TABLE public.lead_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view lead status history"
  ON public.lead_status_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert lead status history"
  ON public.lead_status_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Tabela de logs de integração com a Meta
CREATE TABLE IF NOT EXISTS public.meta_integration_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  request_payload JSONB,
  response_payload JSONB,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  test_event_code TEXT,
  http_status INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meta_logs_lead_id ON public.meta_integration_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_meta_logs_created_at ON public.meta_integration_logs(created_at DESC);

ALTER TABLE public.meta_integration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view meta logs"
  ON public.meta_integration_logs FOR SELECT
  TO authenticated
  USING (true);

-- 4. Trigger updated_at para leads (caso ainda não exista)
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
