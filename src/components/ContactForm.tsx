import { motion } from "framer-motion";
import { useState } from "react";
import { saveLead } from "@/lib/leads";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "551496684609";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    city: "",
    message: "",
    isParticular: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Block submission when Particular = "Não"
    if (formData.isParticular === "Não") {
      // Still save lead for CRM metrics (marked as rejected)
      saveLead({
        name: formData.name,
        whatsapp: formData.whatsapp,
        city: formData.city,
        message: formData.message,
        isParticular: formData.isParticular,
      });

      toast.error("Atendimento apenas particular", {
        description:
          "Infelizmente, no momento realizamos apenas atendimentos particulares. Caso deseje prosseguir com nossa clínica, por favor reenvie o formulário selecionando \"Sim\" para atendimento particular.",
        duration: 8000,
      });
      return;
    }

    saveLead({
      name: formData.name,
      whatsapp: formData.whatsapp,
      city: formData.city,
      message: formData.message,
      isParticular: formData.isParticular,
    });

    const lines = [
      `*Nova solicitação de contato*`,
      ``,
      `*Nome:* ${formData.name || "Não informado"}`,
      `*WhatsApp:* ${formData.whatsapp}`,
      `*Cidade:* ${formData.city}`,
      `*Atendimento particular:* ${formData.isParticular || "Não respondeu"}`,
      `*Condição odontológica:* ${formData.message || "Não informado"}`,
    ];
    const text = lines.join("\n");
    window.open(
      `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(text)}`,
      "_blank"
    );

    // GTM: dispara evento apenas após envio bem-sucedido
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'formulario_enviado',
      nome_formulario: 'lead_principal',
    });
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
                href={`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent("Olá, gostaria de mais informações!")}`}
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
                {/* Particular question */}
                <div>
                  <p className="text-sm text-foreground mb-3">
                    <span className="text-destructive">*</span> A clínica realiza atendimento particular. Deseja continuar?
                  </p>
                  <div className="flex gap-4">
                    {["Sim", "Não"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="particular"
                          value={opt}
                          checked={formData.isParticular === opt}
                          onChange={() => setFormData({ ...formData, isParticular: opt })}
                          className="w-4 h-4 text-primary accent-primary"
                        />
                        <span className="text-sm text-foreground">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

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
                  className="w-full bg-primary text-primary-foreground py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity rounded-xl"
                >
                  Enviar agora mesmo
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
