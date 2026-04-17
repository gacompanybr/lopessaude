import { supabase } from "@/integrations/supabase/client";

export type LeadStatus = "novo" | "em_contato" | "agendado" | "convertido" | "perdido";
export type LeadOrigem = "site" | "manual" | "whatsapp" | "indicacao" | "redes_sociais" | "outro";

export interface Lead {
  id: string;
  name: string | null;
  whatsapp: string;
  city: string;
  message: string | null;
  status: LeadStatus;
  origem: LeadOrigem;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewLeadInput {
  name?: string | null;
  whatsapp: string;
  city: string;
  message?: string | null;
  status?: LeadStatus;
  origem?: LeadOrigem;
  notes?: string | null;
}

export async function getLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as Lead[];
}

export async function saveLead(lead: NewLeadInput): Promise<Lead> {
  const { data, error } = await supabase
    .from("leads")
    .insert({
      name: lead.name ?? null,
      whatsapp: lead.whatsapp,
      city: lead.city,
      message: lead.message ?? null,
      status: lead.status ?? "novo",
      origem: lead.origem ?? "site",
      notes: lead.notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Lead;
}

export async function updateLead(
  id: string,
  updates: Partial<Pick<Lead, "name" | "whatsapp" | "city" | "message" | "status" | "origem" | "notes">>
): Promise<Lead> {
  const { data, error } = await supabase
    .from("leads")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Lead;
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: "Novo",
  em_contato: "Em contato",
  agendado: "Agendado",
  convertido: "Convertido",
  perdido: "Perdido",
};

export const ORIGEM_LABELS: Record<LeadOrigem, string> = {
  site: "Site",
  manual: "Manual",
  whatsapp: "WhatsApp",
  indicacao: "Indicação",
  redes_sociais: "Redes sociais",
  outro: "Outro",
};
