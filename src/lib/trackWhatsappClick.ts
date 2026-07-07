import { savePublicLead } from "@/lib/leads";
import { captureMetaTracking } from "@/lib/metaTracking";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    fbq?: (...args: unknown[]) => void;
    __metaPixelFallback?: (...args: unknown[]) => void;
  }
}

const SESSION_KEY = "lopessaude_wa_click_lead_id";
const SESSION_SOURCE_KEY = "lopessaude_wa_click_lead_source";

/**
 * Envia o evento `clique_whatsapp` para o dataLayer do GTM.
 */
export function pushWhatsappDataLayerEvent(params: {
  linkUrl?: string;
  buttonText?: string;
  source?: string;
}): void {
  if (typeof window === "undefined") return;
  const linkUrl = params.linkUrl || "";
  const linkText = params.buttonText || params.source || "WhatsApp";
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "clique_whatsapp",
    link_url: linkUrl,
    link_text: linkText,
    page_url: window.location.href,
    event_category: "Contato",
    event_action: "click",
    event_label: "WhatsApp",
    channel: "whatsapp",
    page_path: window.location.pathname,
    button_text: linkText,
    source: params.source || "",
  });
}

/**
 * Cria um lead "leve" no CRM quando o usuário clica em um botão de WhatsApp.
 * - Deduplica por sessão (uma pessoa que clica em vários botões vira 1 lead só).
 * - Captura tracking (gclid, fbc, fbp, utm...) para o classificador aplicar a
 *   tag google_ads / meta_ads / organico automaticamente.
 * - Não temos o número/nome nesse momento — usa placeholders e deixa claro na
 *   mensagem que o contato ainda não confirmou o envio da mensagem.
 */
async function createWhatsappClickLead(source: string, linkUrl?: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) {
      // Já foi criado nessa sessão — não duplicar.
      return;
    }
    // Marca ANTES do await pra evitar corrida em cliques quase simultâneos.
    sessionStorage.setItem(SESSION_KEY, "pending");
    sessionStorage.setItem(SESSION_SOURCE_KEY, source);

    const tracking = captureMetaTracking();
    const messageLines = [
      `Lead gerado por clique no botão de WhatsApp — ${source}.`,
      `Número ainda não capturado (usuário clicou para abrir o WhatsApp, mas ainda não enviou mensagem).`,
      linkUrl ? `Link: ${linkUrl}` : null,
    ].filter(Boolean);

    const created = await savePublicLead({
      name: null,
      whatsapp: "Não informado (clique WhatsApp)",
      city: "Não informado",
      message: messageLines.join("\n"),
      origem: "whatsapp",
      status: "novo",
      tracking,
    });
    sessionStorage.setItem(SESSION_KEY, created.id);
  } catch (e) {
    // Se falhar, libera pra tentar de novo em próximo clique
    sessionStorage.removeItem(SESSION_KEY);
    console.warn("[createWhatsappClickLead] falha:", e);
  }
}

/**
 * Rastreia o clique em botão de WhatsApp:
 * - Dispara evento no dataLayer (GTM)
 * - Dispara evento no Meta Pixel
 * - Cria lead leve no CRM (deduplicado por sessão)
 */
export async function trackWhatsappClick(source: string, linkUrl?: string): Promise<void> {
  try {
    pushWhatsappDataLayerEvent({ linkUrl, buttonText: source, source });
  } catch (e) {
    console.warn("[trackWhatsappClick] dataLayer error:", e);
  }

  try {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "Lead", { content_name: source });
    }
    if (typeof window !== "undefined" && typeof window.__metaPixelFallback === "function") {
      window.__metaPixelFallback("Lead", { content_name: source });
    }
  } catch (e) {
    console.warn("[trackWhatsappClick] pixel error:", e);
  }

  // Fire-and-forget — não bloqueia a abertura do WhatsApp
  void createWhatsappClickLead(source, linkUrl);
}

/**
 * Usado pelo listener global (WhatsAppClickTracker) para garantir criação
 * do lead mesmo em links de WhatsApp que não passam pelos handlers dos botões.
 */
export function ensureWhatsappClickLead(source: string, linkUrl?: string): void {
  void createWhatsappClickLead(source, linkUrl);
}
