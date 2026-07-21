import { motion } from "framer-motion";
import { trackWhatsappClick } from "@/lib/trackWhatsappClick";
import heroBanner from "@/assets/hero-karen-clinica.png.asset.json";
import logoLopes from "@/assets/logo-lopes.jpg";

const WA_URL =
  "https://api.whatsapp.com/send?phone=5514996684609&text=Ol%C3%A1%20vim%20do%20site%20e%20gostaria%20de%20agendar%20uma%20avalia%C3%A7%C3%A3o";

const Hero = () => {
  return (
    <section className="relative bg-primary overflow-hidden">
      {/* Doctor identity pill */}
      <div className="relative z-10 flex justify-center pt-6 sm:pt-8">
        <div className="bg-card rounded-2xl shadow-md px-6 sm:px-10 py-3 flex items-center gap-4">
          <img src={logoLopes} alt="Lopes Saúde e Odontologia" className="h-10 sm:h-12 object-contain" />
          <div className="h-8 sm:h-10 w-px bg-border" />
          <div>
            <p className="font-bold text-foreground text-sm sm:text-base leading-tight uppercase tracking-wide">
              Dra. Karen Lopes
            </p>
            <p className="text-muted-foreground text-[10px] sm:text-xs uppercase tracking-wider">
              Cirurgiã-Dentista · CROSP 94468
            </p>
          </div>
        </div>
      </div>

      {/* Hero content */}
      <div className="section-container relative z-10 grid lg:grid-cols-2 gap-8 items-center pt-12 lg:pt-16 pb-8 lg:pb-0">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-primary-foreground lg:pr-6"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] mb-6">
            Transformando sorrisos em Bauru com saúde, estética e confiança.
          </h1>
          <p className="text-primary-foreground/90 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
            Clínica odontológica com atendimento humanizado, estrutura moderna e
            tratamentos especializados em Prótese, Protocolo, Implante,
            Ortodontia e Alinhadores Invisíveis.
          </p>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-track="whatsapp-click"
            data-event="clique_whatsapp"
            data-channel="whatsapp"
            onClick={() => { void trackWhatsappClick("Hero — Agende sua avaliação", WA_URL); }}
            className="inline-block bg-card text-primary px-10 py-4 text-sm font-bold hover:opacity-90 transition-opacity rounded-full shadow-md"
          >
            Agende sua avaliação
          </a>
        </motion.div>

        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative flex justify-center lg:justify-end items-end"
        >
          <div className="relative w-full">
            <img
              src={heroBanner.url}
              alt="Dra. Karen Lopes na clínica Lopes Saúde e Odontologia em Bauru"
              className="relative w-full aspect-[5/2] object-cover object-center rounded-2xl saturate-[0.85]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
