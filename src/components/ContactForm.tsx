import { motion } from "framer-motion";
import { useState } from "react";
import { saveLead, sendMetaEvent, STATUS_TO_META_EVENT } from "@/lib/leads";
import { captureMetaTracking } from "@/lib/metaTracking";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "551496684609";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    city: "",
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
      `*Nome:* ${formData.name || "Não informado"}`,
      `*WhatsApp:* ${formData.whatsapp}`,
      `*Cidade:* ${formData.city}`,
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
      const created = await saveLead({
        name: formData.name || null,
        whatsapp: formData.whatsapp,
        city: formData.city,
        message: formData.message || null,
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

              <a
                href={`https://api.whatsapp.com/send?phone=5514996684609&text=${encodeURIComponent("Olá, vim pelo Google e gostaria de saber mais informações")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-8 bg-primary text-primary-foreground px-10 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity rounded-xl"
              >
                Enviar agora mesmo
              </a>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="px-8 lg:px-12 py-10 lg:py-14 bg-background/50"
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                <input
                  type="text"
                  placeholder="Nome"
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
