import { savePublicLead } from "@/lib/leads";
import { captureMetaTracking } from "@/lib/metaTracking";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

/**
 * Envia o evento `whatsapp_click` para o dataLayer do GTM.
 * Chamado tanto pelos handlers dos botões quanto pelo listener global.
 */
export function pushWhatsappDataLayerEvent(params: {
  linkUrl?: string;
  buttonText?: string;
  source?: string;
}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "whatsapp_click",
    event_category: "Contato",
    event_action: "click",
    event_label: "WhatsApp",
    channel: "whatsapp",
    link_url: params.linkUrl || "",
    page_path: window.location.pathname,
    page_url: window.location.href,
    button_text: params.buttonText || params.source || "WhatsApp",
    source: params.source || "",
  });
}

/**
 * Registra um clique em botão de WhatsApp como lead no CRM,
 * dispara o evento Lead no Meta Pixel e envia o evento
 * whatsapp_click para o dataLayer do GTM.
 * Não bloqueia o fluxo: erros são apenas logados.
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

  try {
    const tracking = captureMetaTracking();
    await savePublicLead({
      name: `Clique WhatsApp — ${source}`,
      whatsapp: "Não informado",
      city: "Não informado",
      message: `Lead gerado por clique no botão "${source}". Contato iniciado via WhatsApp direto.`,
      origem: "whatsapp",
      tracking,
    });
  } catch (e) {
    console.warn("[trackWhatsappClick] save lead error:", e);
  }
}
