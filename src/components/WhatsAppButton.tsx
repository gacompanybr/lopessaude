import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/5514996684609"
      target="_blank"
      rel="noopener noreferrer"
      className="floating-whatsapp"
      aria-label="Enviar mensagem pelo WhatsApp"
      title="Enviar mensagem pelo WhatsApp"
    >
      <MessageCircle className="w-6 h-6 text-primary-foreground" />
    </a>
  );
};

export default WhatsAppButton;
