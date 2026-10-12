import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface EvolutionConfig {
  baseUrl: string;
  apiKey: string;
  instance: string;
}

const STORAGE_KEY = "evolution_config_v1";

const DEFAULT_CONFIG: EvolutionConfig = {
  baseUrl: "https://evo.gacompany.online",
  apiKey: "",
  instance: "port_bab9656f_n1k1u",
};

export function getDefaultEvolutionConfig(): EvolutionConfig {
  return { ...DEFAULT_CONFIG };
}

export function getEvolutionConfig(): EvolutionConfig {
  localStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_CONFIG };
}

export function saveEvolutionConfig(_cfg: EvolutionConfig) {
  localStorage.removeItem(STORAGE_KEY);
}

export function clearEvolutionConfig() {
  localStorage.removeItem(STORAGE_KEY);
}

async function req(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('evolution-dispatch', { body });
  if (error) {
    const details = error instanceof FunctionsHttpError ? await error.context.json().catch(() => null) : null;
    throw new Error(details?.error || error.message);
  }
  return data;
}

/** Status geral da instância: "open" = conectada, "connecting"/"close" = precisa QR. */
export async function fetchConnectionState(_cfg: EvolutionConfig): Promise<string> {
  const j = await req({ action: 'status' });
  return j?.state || "unknown";
}

/** Retorna { base64, code } do QR (ou pairingCode). Cria a instância se não existir. */
export async function fetchQrCode(_cfg: EvolutionConfig): Promise<{ base64?: string; code?: string; pairingCode?: string }> {
  return req({ action: 'connect' });
}

export async function logoutInstance(_cfg: EvolutionConfig): Promise<void> {
  await req({ action: 'logout' });
}

/** Envia mensagem de texto. Aceita número em qualquer formato — normaliza pra E.164 sem símbolos. */
export async function sendTextMessage(_cfg: EvolutionConfig, phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  const number = digits.startsWith("55") ? digits : `55${digits}`;
  return req({ action: 'send', phone: number, text });
}
