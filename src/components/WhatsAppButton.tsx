import { MessageCircle } from "lucide-react";
import { trackWhatsappClick } from "@/lib/trackWhatsappClick";

const WhatsAppButton = () => {
  return (
    <a
      href="https://api.whatsapp.com/send?phone=5514998805438&text=Ol%C3%A1%20vim%20do%20site%20e%20gostaria%20de%20agendar%20uma%20consulta"
      target="_blank"
      rel="noopener noreferrer"
      data-track="whatsapp-click"
      data-event="clique_whatsapp"
      data-channel="whatsapp"
      onClick={() => { void trackWhatsappClick("Botão flutuante WhatsApp", "https://api.whatsapp.com/send?phone=5514998805438"); }}
      className="floating-whatsapp"
      aria-label="Enviar mensagem pelo WhatsApp"
      title="Enviar mensagem pelo WhatsApp"
    >
      <MessageCircle className="w-6 h-6 text-primary-foreground" />
    </a>
  );
};

export default WhatsAppButton;
