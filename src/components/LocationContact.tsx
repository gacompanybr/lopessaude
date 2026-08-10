import { motion } from "framer-motion";
import { MapPin, Clock, Phone, Instagram, MessageCircle } from "lucide-react";
import { trackWhatsappClick } from "@/lib/trackWhatsappClick";

const WA_URL =
  "https://api.whatsapp.com/send?phone=5514998805438&text=Ol%C3%A1%20vim%20do%20site%20e%20gostaria%20de%20agendar%20uma%20avalia%C3%A7%C3%A3o";

const LocationContact = () => {
  return (
    <section id="localizacao" className="py-20 lg:py-28 bg-card">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wide">
            Onde estamos
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
            Venha nos visitar em Bauru
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden shadow-sm min-h-[420px] bg-background"
          >
            <iframe
              title="Localização Lopes Saúde e Odontologia — Bauru"
              src="https://www.google.com/maps?q=Av.+Getulio+Vargas+Bauru+SP&output=embed"
              className="w-full h-full min-h-[420px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-background rounded-3xl p-8 lg:p-10 flex flex-col gap-6"
          >
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm mb-1">Bauru — Unidade principal</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Avenida Getúlio Vargas — Bauru/SP
                </p>
                <p className="font-bold text-foreground text-sm mt-3 mb-1">Duartina</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Av. São Paulo, 227 — Centro · Duartina/SP · CEP 17470-000
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm mb-1">Horário de atendimento</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Segunda a Sexta: 8h às 18h<br />
                  Sábado: 8h às 12h<br />
                  Domingo: Fechado
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm mb-1">Fale conosco</p>
                <a href="tel:+5514998805438" className="text-sm text-muted-foreground hover:text-primary transition-colors block">
                  +55 (14) 99880-5438
                </a>
                <a
                  href="https://instagram.com/lopes_saude"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 mt-1"
                >
                  <Instagram className="w-4 h-4" /> @lopes_saude
                </a>
              </div>
            </div>

            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-track="whatsapp-click"
              data-event="clique_whatsapp"
              data-channel="whatsapp"
              onClick={() => { void trackWhatsappClick("Localização — WhatsApp", WA_URL); }}
              className="mt-2 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="w-4 h-4" />
              Falar no WhatsApp
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LocationContact;
