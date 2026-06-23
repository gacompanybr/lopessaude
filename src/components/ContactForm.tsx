import { motion } from "framer-motion";
import { useState } from "react";
import { savePublicLead, sendMetaEvent, STATUS_TO_META_EVENT } from "@/lib/leads";
import { captureMetaTracking } from "@/lib/metaTracking";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "551496684609";

const QUICK_NEEDS = [
  "Limpeza / prevenção",
  "Dor de dente / urgência",
  "Estética / clareamento",
  "Avaliação geral / não sei ainda",
  "Outro",
];

const AVAILABILITY_OPTIONS = [
  "Quero agendar esta semana",
  "Quero agendar este mês",
  "Ainda estou pesquisando",
];




// Máscara BR: (XX) XXXXX-XXXX
const maskPhoneBR = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    email: "",
    quickNeed: "",
    availability: "",
    intent: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Monta mensagem do WhatsApp já no gesto do usuário (mobile)
    const lines = [
      `*Nova solicitação de contato*`,
      ``,
      `*Nome:* ${formData.name}`,
      `*WhatsApp:* ${formData.whatsapp}`,
      formData.email ? `*E-mail:* ${formData.email}` : null,
      `*Necessidade:* ${formData.quickNeed || "Não informado"}`,
      `*Disponibilidade:* ${formData.availability}`,
      `*Intenção:* ${formData.intent}`,
      formData.message ? `*Detalhes:* ${formData.message}` : null,
    ].filter(Boolean);
    const text = lines.join("\n");
    const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(text)}`;

    const waWindow = window.open("about:blank", "_blank");
    setSubmitting(true);

    let leadSavedOk = false;
    let createdId: string | null = null;
    let tracking: ReturnType<typeof captureMetaTracking> | null = null;
    try {
      tracking = captureMetaTracking();
      const composedMessage = [
        formData.quickNeed ? `Necessidade: ${formData.quickNeed}` : null,
        `Disponibilidade: ${formData.availability}`,
        `Intenção: ${formData.intent}`,
        formData.email ? `E-mail: ${formData.email}` : null,
        formData.message || null,
      ]
        .filter(Boolean)
        .join("\n\n");

      const created = await savePublicLead({
        name: formData.name,
        whatsapp: formData.whatsapp,
        city: "",
        message: composedMessage || null,
        origem: "site",
        status: "novo",
        tracking,
      });
      createdId = created.id;
      leadSavedOk = true;

      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: "formulario_enviado",
        nome_formulario: "lead_principal",
      });

      try {
        const fbq = (window as any).fbq;
        if (typeof fbq === "function") {
          fbq("track", "Lead", {
            content_name: "lead_principal",
            content_category: "whatsapp_form",
          });
          fbq("trackCustom", "WhatsAppConversation", { source: "contact_form" });
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
      if (createdId) {
        sendMetaEvent({
          lead_id: createdId,
          event_name: STATUS_TO_META_EVENT.novo,
          tracking,
        });
      }
      if (waWindow && !waWindow.closed) {
        waWindow.location.href = waUrl;
      } else {
        window.location.href = waUrl;
      }
    } else {
      if (waWindow && !waWindow.closed) {
        waWindow.close();
      }
    }
  };

  const labelClass = "block text-xs font-semibold text-foreground mb-1.5";
  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors";

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
                <p className="text-xs text-muted-foreground text-center">
                  Somos uma Clínica Particular
                </p>

                <div>
                  <label className={labelClass}>Nome completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>WhatsApp (com DDD)</label>
                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    placeholder="(14) 99668-4609"
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp: maskPhoneBR(e.target.value) })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>E-mail (opcional)</label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Qual a sua intenção de agendamento?</label>
                  <select
                    required
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Selecione uma opção</option>
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>O que você precisa?</label>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_NEEDS.map((opt) => {
                      const active = formData.quickNeed === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormData({ ...formData, quickNeed: opt })}
                          className={`px-3 py-2 rounded-full text-xs font-medium border transition-colors ${
                            active
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card text-foreground border-border hover:border-primary/60"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Conte brevemente o que você precisa (opcional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Se quiser, adicione algum detalhe…"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`${inputClass} resize-none`}
                  />
                </div>


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
