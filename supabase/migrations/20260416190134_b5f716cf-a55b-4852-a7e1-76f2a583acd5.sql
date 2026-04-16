-- Enum para status do lead
CREATE TYPE public.lead_status AS ENUM ('novo', 'em_contato', 'agendado', 'convertido', 'perdido');

-- Enum para origem do lead
CREATE TYPE public.lead_origem AS ENUM ('site', 'manual', 'whatsapp', 'indicacao', 'outro');

-- Tabela leads
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  whatsapp TEXT NOT NULL,
  city TEXT NOT NULL,
  message TEXT,
  status public.lead_status NOT NULL DEFAULT 'novo',
  origem public.lead_origem NOT NULL DEFAULT 'site',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance dos filtros
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_origem ON public.leads(origem);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (CRM interno sem auth) - aviso: dados pessoais ficam acessíveis
CREATE POLICY "Public can insert leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can view leads"
  ON public.leads FOR SELECT
  USING (true);

CREATE POLICY "Public can update leads"
  ON public.leads FOR UPDATE
  USING (true);

CREATE POLICY "Public can delete leads"
  ON public.leads FOR DELETE
  USING (true);

-- Função de atualização do updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();