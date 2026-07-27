import { motion } from "framer-motion";
import { trackWhatsappClick } from "@/lib/trackWhatsappClick";
import heroBanner from "@/assets/hero-karen-clinica.png.asset.json";
import logoLopes from "@/assets/logo-lopes.jpg";

const WA_URL =
  "https://api.whatsapp.com/send?phone=5514998805438&text=Ol%C3%A1%20vim%20do%20site%20e%20gostaria%20de%20agendar%20uma%20avalia%C3%A7%C3%A3o";

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Full-bleed banner image */}
      <div className="relative w-full h-[80vh] min-h-[560px] max-h-[820px]">
        <img
          src={heroBanner.url}
          alt="Dra. Karen Lopes na clínica Lopes Saúde e Odontologia em Bauru"
          width="1920"
          height="1080"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-center saturate-[0.9]"
        />
        {/* Subtle overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30" />

        {/* Doctor identity pill */}
        <div className="relative z-10 flex justify-center pt-6 sm:pt-8">
          <div className="bg-card/85 backdrop-blur-md rounded-2xl shadow-lg px-6 sm:px-10 py-3 flex items-center gap-4 border border-white/40">
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

        {/* Overlay content */}
        <div className="absolute inset-0 z-10 flex items-end justify-center">
          <div className="section-container w-full text-center pb-12">
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-track="whatsapp-click"
              data-event="clique_whatsapp"
              data-channel="whatsapp"
              onClick={() => { void trackWhatsappClick("Hero — Agende sua avaliação", WA_URL); }}
              className="inline-block bg-primary text-primary-foreground px-10 py-4 text-sm font-bold hover:opacity-90 transition-opacity rounded-xl shadow-md"
            >
              Agende sua avaliação
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
