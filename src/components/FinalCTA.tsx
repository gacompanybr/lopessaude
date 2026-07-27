import { motion } from "framer-motion";
import { trackWhatsappClick } from "@/lib/trackWhatsappClick";

const WA_URL =
  "https://api.whatsapp.com/send?phone=5514998805438&text=Ol%C3%A1%20vim%20do%20site%20e%20gostaria%20de%20agendar%20uma%20avalia%C3%A7%C3%A3o";

const FinalCTA = () => {
  return (
    <section className="py-16 lg:py-20 bg-primary">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto text-primary-foreground"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-bold leading-tight mb-4">
            Gostou do que viu? Transforme seu sorriso também.
          </h2>
          <p className="text-primary-foreground/85 text-base leading-relaxed mb-8">
            Agende sua avaliação com a nossa equipe pelo WhatsApp. Atendimento
            particular, humanizado e com plano de tratamento personalizado.
          </p>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-track="whatsapp-click"
            data-event="clique_whatsapp"
            data-channel="whatsapp"
            onClick={() => { void trackWhatsappClick("Final CTA — Agende sua avaliação", WA_URL); }}
            className="inline-block bg-card text-primary px-10 py-4 text-sm font-bold rounded-full shadow-md hover:opacity-90 transition-opacity"
          >
            Agende sua avaliação
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
