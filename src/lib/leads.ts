import { supabase } from "@/integrations/supabase/client";
import type { MetaTracking } from "@/lib/metaTracking";

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
  // Campos técnicos da Meta (opcionais — só preenchidos se a integração rodou)
  email?: string | null;
  state?: string | null;
  meta_lead_id?: string | null;
  meta_fbc?: string | null;
  meta_fbp?: string | null;
  meta_ctwa_clid?: string | null;
  sincronizado_meta?: boolean | null;
  ultimo_status_enviado_meta?: string | null;
  ultimo_envio_meta_em?: string | null;
  ultimo_retorno_meta?: unknown;
  ultimo_erro_meta?: string | null;
}

export interface NewLeadInput {
  name?: string | null;
  whatsapp: string;
  city: string;
  message?: string | null;
  status?: LeadStatus;
  origem?: LeadOrigem;
  notes?: string | null;
  email?: string | null;
  state?: string | null;
  tracking?: MetaTracking | null;
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
      email: lead.email ?? null,
      state: lead.state ?? null,
      meta_fbc: lead.tracking?.fbc ?? null,
      meta_fbp: lead.tracking?.fbp ?? null,
      meta_ctwa_clid: lead.tracking?.ctwa_clid ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Lead;
}

export async function updateLead(
  id: string,
  updates: Partial<Pick<Lead, "name" | "whatsapp" | "city" | "message" | "status" | "origem" | "notes" | "email" | "state">>
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

/**
 * Dispara um evento para a Meta Conversions API através da Edge Function.
 * NUNCA falha o fluxo principal: erros são apenas logados.
 */
export async function sendMetaEvent(params: {
  lead_id: string;
  event_name: string;
  old_status?: string | null;
  tracking?: MetaTracking | null;
}): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke("meta-send-event", {
      body: {
        lead_id: params.lead_id,
        event_name: params.event_name,
        old_status: params.old_status ?? null,
        tracking: params.tracking ?? undefined,
      },
    });
    if (error) console.warn("[meta-send-event] retorno com erro:", error);
  } catch (e) {
    console.warn("[meta-send-event] falha ao invocar:", e);
  }
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

/** Mapeia o status interno para o nome de evento esperado pela Meta. */
export const STATUS_TO_META_EVENT: Record<LeadStatus, string> = {
  novo: "Novo",
  em_contato: "EmContato",
  agendado: "Agendado",
  convertido: "Convertido",
  perdido: "Perdido",
};
