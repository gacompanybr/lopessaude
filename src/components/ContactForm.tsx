import { motion } from "framer-motion";
import { useState } from "react";
import { savePublicLead, sendMetaEvent, STATUS_TO_META_EVENT } from "@/lib/leads";
import { captureMetaTracking } from "@/lib/metaTracking";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "551496684609";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    city: "",
    availability: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Monta a URL do WhatsApp já agora (dentro do gesto do usuário) para
    // que o navegador a aceite mesmo após o await.
    const lines = [
      `*Nova solicitação de contato*`,
      ``,
      `*Nome:* ${formData.name}`,
      `*WhatsApp:* ${formData.whatsapp}`,
      `*Cidade:* ${formData.city}`,
      `*Disponibilidade para consulta este mês:* ${formData.availability || "Não informado"}`,
      `*Condição odontológica:* ${formData.message || "Não informado"}`,
    ];
    const text = lines.join("\n");
    const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(text)}`;

    // CRÍTICO MOBILE: abrir uma janela/aba JÁ AGORA, sincronamente, dentro do
    // gesto do usuário (touchend). Se esperarmos o await do saveLead, iOS Safari
    // e Chrome Android bloqueiam a abertura do WhatsApp porque o gesto "expirou".
    // A janela abre como about:blank e depois redirecionamos pra URL do WhatsApp.
    const waWindow = window.open("about:blank", "_blank");

    setSubmitting(true);

    let leadSavedOk = false;
    let createdId: string | null = null;
    let tracking: ReturnType<typeof captureMetaTracking> | null = null;
    try {
      tracking = captureMetaTracking();
      const composedMessage = [
        formData.availability
          ? `Disponibilidade este mês: ${formData.availability}`
          : null,
        formData.message || null,
      ]
        .filter(Boolean)
        .join("\n\n");

      const created = await savePublicLead({
        name: formData.name,
        whatsapp: formData.whatsapp,
        city: formData.city,
        message: composedMessage || null,
        origem: "site",
        status: "novo",
        tracking,
      });
      createdId = created.id;
      leadSavedOk = true;

      // GTM: dispara evento apenas após envio bem-sucedido
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: 'formulario_enviado',
        nome_formulario: 'lead_principal',
      });

      // Meta Pixel: dispara evento de Lead (conversa iniciada via WhatsApp)
      try {
        const fbq = (window as any).fbq;
        if (typeof fbq === "function") {
          fbq("track", "Lead", {
            content_name: "lead_principal",
            content_category: "whatsapp_form",
          });
          fbq("trackCustom", "WhatsAppConversation", {
            source: "contact_form",
          });
        }
        if (typeof (window as any).__metaPixelFallback === "function") {
          (window as any).__metaPixelFallback("Lead", {
            content_name: "lead_principal",
            content_category: "whatsapp_form",
          });
          (window as any).__metaPixelFallback("WhatsAppConversation", {
            source: "contact_form",
          });
        }
      } catch (e) {
        console.warn("Meta Pixel Lead event failed:", e);
      }

      toast.success("Solicitação enviada com sucesso!");
    } catch (err: any) {
      console.error("Erro ao salvar lead:", err);
      // Tenta extrair a mensagem mais útil possível pra debug em mobile
      const detail =
        err?.message ||
        err?.error_description ||
        err?.details ||
        (typeof err === "string" ? err : JSON.stringify(err));
      toast.error("Erro ao enviar", {
        description: detail || "Tente novamente em instantes ou fale conosco pelo WhatsApp.",
        duration: 10000,
      });
    } finally {
      setSubmitting(false);
    }

    if (leadSavedOk) {
      // Dispara o evento Meta em background (não aguarda).
      if (createdId) {
        sendMetaEvent({
          lead_id: createdId,
          event_name: STATUS_TO_META_EVENT.novo,
          tracking,
        });
      }
      // Redireciona a janela já aberta para o WhatsApp.
      // Se o popup foi bloqueado (waWindow === null), faz fallback de mesma aba.
      if (waWindow && !waWindow.closed) {
        waWindow.location.href = waUrl;
      } else {
        window.location.href = waUrl;
      }
    } else {
      // Falhou ao salvar: fecha a janela vazia que abrimos.
      if (waWindow && !waWindow.closed) {
        waWindow.close();
      }
    }
  };

  return (
    <section id="contato" className="py-16 lg:py-24 bg-background">
      <div className="section-container">
        <div className="bg-card rounded-3xl shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Info */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="px-8 lg:px-12 py-10 lg:py-14"
            >
              <p className="text-primary font-semibold text-sm mb-2">Faça o seu agendamento</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Contate-nos</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                Tem alguma dúvida, deseja agendar uma consulta ou saber mais sobre nossos tratamentos? Preencha o formulário e nossa equipe entrará em contato o mais breve possível!
              </p>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Contato</p>
                  <p className="font-semibold text-foreground">+55 (14) 99668-4609</p>
                </div>
                <div className="p-4 rounded-xl bg-background border border-border">
                  <p className="text-muted-foreground italic text-xs leading-relaxed">
                    Nossa missão é transformar sorrisos, promovendo saúde, bem-estar, conforto e segurança por meio de tratamentos odontológicos humanizados e programas preventivos personalizados!
                  </p>
                </div>
              </div>

              <p className="mt-8 text-sm text-foreground font-medium">
                Preencha o formulário ao lado rapidinho para entrar em contato com a nossa equipe.
              </p>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="px-8 lg:px-12 py-10 lg:py-14 bg-background/50"
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary text-center">
                  Lembrete: Somos uma Clínica Particular!
                </div>

                <input
                  type="text"
                  required
                  placeholder="*Nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                />

                <input
                  type="tel"
                  required
                  placeholder="*Whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                />

                <input
                  type="text"
                  required
                  placeholder="*Digite sua cidade"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                />

                <div>
                  <label className="block text-sm text-foreground mb-2">
                    Você teria disponibilidade para consulta este mês ainda?
                  </label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                    <option value="Talvez">Talvez</option>
                  </select>
                </div>

                <textarea
                  rows={4}
                  placeholder="Escreva em detalhes sua condição odontológica"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                />


                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity rounded-xl disabled:opacity-60"
                >
                  {submitting ? "Enviando..." : "Enviar agora mesmo"}
                </button>

                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  Atendimento particular. Valores e opções informados pela equipe após o contato.
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
