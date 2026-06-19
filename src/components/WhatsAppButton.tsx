import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  return (
    <a
      href="#contato"
      className="floating-whatsapp"
      aria-label="Preencha o formulário para entrar em contato"
      title="Preencha o formulário rápido para entrar em contato"
    >
      <MessageCircle className="w-6 h-6 text-primary-foreground" />
    </a>
  );
};

export default WhatsAppButton;
