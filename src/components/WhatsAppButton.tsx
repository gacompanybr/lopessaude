import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  return (
    <a
      href="https://api.whatsapp.com/send?phone=5514996684609&text=Ol%C3%A1%2C%20vim%20pelo%20Google%20e%20gostaria%20de%20saber%20mais%20informa%C3%A7%C3%B5es"
      target="_blank"
      rel="noopener noreferrer"
      className="floating-whatsapp"
      aria-label="Fale conosco pelo WhatsApp"
    >
      <MessageCircle className="w-6 h-6 text-primary-foreground" />
    </a>
  );
};

export default WhatsAppButton;
