// Cliente simples para Evolution API (self-hosted).
// Configuração salva em localStorage do navegador do usuário logado.

export interface EvolutionConfig {
  baseUrl: string;
  apiKey: string;
  instance: string;
}

const STORAGE_KEY = "evolution_config_v1";

const DEFAULT_CONFIG: EvolutionConfig = {
  baseUrl: "https://evo.gacompany.online",
  apiKey: "e1f579cd2b8a109c9959dcd829b1a23cc6de6623",
  instance: "disparo clinica lopes",
};

export function getDefaultEvolutionConfig(): EvolutionConfig {
  return { ...DEFAULT_CONFIG };
}

export function getEvolutionConfig(): EvolutionConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    const p = JSON.parse(raw);
    if (!p?.baseUrl || !p?.apiKey || !p?.instance) return { ...DEFAULT_CONFIG };
    return { baseUrl: p.baseUrl.replace(/\/+$/, ""), apiKey: p.apiKey, instance: p.instance };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveEvolutionConfig(cfg: EvolutionConfig) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...cfg, baseUrl: cfg.baseUrl.replace(/\/+$/, "") })
  );
}

export function clearEvolutionConfig() {
  localStorage.removeItem(STORAGE_KEY);
}

async function req(cfg: EvolutionConfig, path: string, init?: RequestInit) {
  const res = await fetch(`${cfg.baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: cfg.apiKey,
      ...(init?.headers || {}),
    },
  });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  if (!res.ok) {
    const msg = json?.message || json?.error || text || `HTTP ${res.status}`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return json;
}

/** Status geral da instância: "open" = conectada, "connecting"/"close" = precisa QR. */
export async function fetchConnectionState(cfg: EvolutionConfig): Promise<string> {
  const j = await req(cfg, `/instance/connectionState/${encodeURIComponent(cfg.instance)}`);
  return j?.instance?.state || j?.state || "unknown";
}

/** Retorna { base64, code } do QR (ou pairingCode). Cria a instância se não existir. */
export async function fetchQrCode(cfg: EvolutionConfig): Promise<{ base64?: string; code?: string; pairingCode?: string }> {
  try {
    const j = await req(cfg, `/instance/connect/${encodeURIComponent(cfg.instance)}`);
    return {
      base64: j?.base64 || j?.qrcode?.base64,
      code: j?.code || j?.qrcode?.code,
      pairingCode: j?.pairingCode,
    };
  } catch (e: any) {
    // Se instância não existe, cria e tenta de novo
    if (/not.*found|404|does not exist/i.test(e.message)) {
      await req(cfg, "/instance/create", {
        method: "POST",
        body: JSON.stringify({
          instanceName: cfg.instance,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS",
        }),
      });
      const j = await req(cfg, `/instance/connect/${encodeURIComponent(cfg.instance)}`);
      return {
        base64: j?.base64 || j?.qrcode?.base64,
        code: j?.code || j?.qrcode?.code,
        pairingCode: j?.pairingCode,
      };
    }
    throw e;
  }
}

export async function logoutInstance(cfg: EvolutionConfig): Promise<void> {
  await req(cfg, `/instance/logout/${encodeURIComponent(cfg.instance)}`, { method: "DELETE" });
}

/** Envia mensagem de texto. Aceita número em qualquer formato — normaliza pra E.164 sem símbolos. */
export async function sendTextMessage(cfg: EvolutionConfig, phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  const number = digits.startsWith("55") ? digits : `55${digits}`;
  return req(cfg, `/message/sendText/${encodeURIComponent(cfg.instance)}`, {
    method: "POST",
    body: JSON.stringify({
      number,
      text,
      // fallbacks legacy
      textMessage: { text },
      options: { delay: 800, presence: "composing" },
    }),
  });
}
