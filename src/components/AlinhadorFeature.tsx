import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { trackWhatsappClick } from "@/lib/trackWhatsappClick";
import alignerImg from "@/assets/aligner-closeup.jpg.asset.json";

const WA_URL =
  "https://api.whatsapp.com/send?phone=5514998805438&text=Ol%C3%A1%20vim%20do%20site%20e%20gostaria%20de%20saber%20mais%20sobre%20o%20alinhador%20invis%C3%ADvel";

const benefits = [
  "O alinhador é transparente e praticamente imperceptível no seu sorriso",
  "Produzido sem metais, evitando irritações na gengiva e nas bochechas",
  "Você pode remover para comer, beber e higienizar com total liberdade",
  "Tratamento planejado digitalmente — visualização do resultado final",
];

const AlinhadorFeature = () => {
  return (
    <section className="py-20 lg:py-28 bg-secondary">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Alinhador Invisível
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-bold text-foreground leading-tight mb-5">
              O que é o tratamento com alinhadores invisíveis?
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-8">
              Uma tecnologia moderna de ortodontia estética, desenvolvida para
              corrigir o posicionamento dos dentes sem bráquetes ou fios
              metálicos. Cada alinhador é feito sob medida para você, com mais
              conforto e resultados previsíveis — seja para pequenas
              movimentações ou casos mais complexos.
            </p>

            <p className="font-bold text-foreground text-lg mb-4">
              Principais benefícios
            </p>
            <ul className="space-y-3 mb-8">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2.5" />
                  <span className="text-foreground text-[15px] leading-relaxed">
                    {b}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-track="whatsapp-click"
              data-event="clique_whatsapp"
              data-channel="whatsapp"
              onClick={() => { void trackWhatsappClick("Alinhador — Agende avaliação", WA_URL); }}
              className="inline-block bg-primary text-primary-foreground px-10 py-3.5 text-sm font-bold rounded-full hover:opacity-90 transition-opacity"
            >
              Agende uma avaliação
            </a>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="aspect-[3/4] rounded-3xl overflow-hidden">
              <img
                src={alignerImg.url}
                alt="Alinhador invisível sendo colocado — Lopes Saúde Bauru"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-[3/4] rounded-3xl bg-primary flex items-center justify-center mt-10 relative overflow-hidden">
              <div className="text-center text-primary-foreground px-6">
                <p className="text-5xl font-bold mb-2">100%</p>
                <p className="text-sm font-semibold opacity-90 leading-snug">
                  Discreto,<br />removível e<br />sob medida
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AlinhadorFeature;
