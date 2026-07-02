import { useEffect } from "react";
import { pushWhatsappDataLayerEvent } from "@/lib/trackWhatsappClick";

const WA_HOSTS = ["wa.me", "api.whatsapp.com", "web.whatsapp.com", "whatsapp.com/send"];

/**
 * Listener global que garante o disparo do evento `whatsapp_click`
 * no dataLayer sempre que qualquer link para WhatsApp for clicado,
 * mesmo que o handler direto no componente não seja executado.
 * Usa um WeakSet para evitar duplicidade quando o próprio botão
 * já disparou o evento no onClick.
 */
const recentlyTracked = new WeakSet<HTMLElement>();

const WhatsAppClickTracker = () => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.getAttribute("href") || "";
      const isWa = WA_HOSTS.some((h) => href.includes(h));
      if (!isWa) return;

      if (recentlyTracked.has(link)) return;
      recentlyTracked.add(link);
      setTimeout(() => recentlyTracked.delete(link), 1000);

      pushWhatsappDataLayerEvent({
        linkUrl: href,
        buttonText:
          link.innerText?.trim() ||
          link.getAttribute("aria-label") ||
          link.getAttribute("title") ||
          "WhatsApp",
        source: link.dataset.track || "global-listener",
      });
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
};

export default WhatsAppClickTracker;
