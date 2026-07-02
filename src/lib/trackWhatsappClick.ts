import { savePublicLead } from "@/lib/leads";
import { captureMetaTracking } from "@/lib/metaTracking";

/**
 * Registra um clique em botão de WhatsApp como lead no CRM
 * e dispara o evento Lead no Meta Pixel.
 * Não bloqueia o fluxo: erros são apenas logados.
 */
export async function trackWhatsappClick(source: string): Promise<void> {
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
