declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

/**
 * Envia o evento `clique_whatsapp` para o dataLayer do GTM.
 * Chamado tanto pelos handlers dos botões quanto pelo listener global.
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
    // campos adicionais mantidos para compatibilidade com tags existentes
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
 * Rastreia o clique em botão de WhatsApp APENAS para fins de analytics
 * (GTM dataLayer + Meta Pixel). NÃO cria lead no CRM — o lead só é
 * registrado quando a pessoa realmente envia mensagem/preenche formulário.
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
}
