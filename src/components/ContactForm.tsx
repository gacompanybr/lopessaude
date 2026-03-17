import { motion } from "framer-motion";
import { useState } from "react";
import { Send, MapPin, Phone, Mail } from "lucide-react";
import { saveLead } from "@/lib/leads";

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

    // Save lead to localStorage
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
  };

  return (
    <section id="contato" className="py-20 lg:py-28 bg-card">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="section-badge mb-4">Faça o seu agendamento</span>
            <h2 className="section-title mb-4">
              <span className="gradient-text">Contate-nos</span>
            </h2>
            <p className="section-subtitle mb-10">
              Tem alguma dúvida, deseja agendar uma consulta ou saber mais sobre nossos tratamentos? Preencha o formulário e nossa equipe entrará em contato!
            </p>

            <div className="space-y-5">
              {[
                { icon: Phone, label: "Contato", value: "+55 (14) 99668-4609" },
                { icon: Mail, label: "E-mail", value: "lopes.saude@hotmail.com" },
                { icon: MapPin, label: "Endereço", value: "Av. São Paulo, 227 – Centro, Duartina - SP" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-semibold text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-5 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-sm text-muted-foreground italic">
                "Nossa missão é transformar sorrisos, promovendo saúde, bem-estar, conforto e segurança por meio de tratamentos odontológicos humanizados e programas preventivos personalizados!"
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <form onSubmit={handleSubmit} className="card-elevated p-8 space-y-5">
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  * A clínica realiza atendimento particular. Deseja continuar?
                </p>
                <div className="flex gap-3">
                  {["Sim", "Não"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFormData({ ...formData, isParticular: opt })}
                      className={`px-6 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                        formData.isParticular === opt
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {[
                { key: "name", label: "Nome", type: "text", required: false, placeholder: "Seu nome" },
                { key: "whatsapp", label: "WhatsApp *", type: "tel", required: true, placeholder: "(14) 99999-9999" },
                { key: "city", label: "Cidade *", type: "text", required: true, placeholder: "Digite sua cidade" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    required={field.required}
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Sua condição odontológica
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none"
                  placeholder="Escreva em detalhes sua condição odontológica"
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                <Send className="w-4 h-4" />
                Enviar agora mesmo
              </button>

              <p className="text-xs text-muted-foreground text-center">
                Ao clicar em enviar, você será redirecionado para o WhatsApp com todas as informações preenchidas.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
