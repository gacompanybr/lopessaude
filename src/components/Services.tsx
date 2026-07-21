import { motion } from "framer-motion";
import {
  Sparkles,
  Cog,
  Smile,
  AlignHorizontalDistributeCenter,
  Sun,
  Gem,
  Wand2,
  Activity,
  Brush,
  Siren,
} from "lucide-react";
import { trackWhatsappClick } from "@/lib/trackWhatsappClick";

const WA_URL =
  "https://api.whatsapp.com/send?phone=5514996684609&text=Ol%C3%A1%20vim%20do%20site%20e%20gostaria%20de%20saber%20mais%20sobre%20os%20tratamentos";

const services = [
  {
    title: "Prótese Dentária e Protocolo",
    desc: "Prótese fixa, removível, dentadura e protocolo sobre implantes. Reabilitação oral sob medida para conforto, estética e mastigação natural.",
    icon: Smile,
  },
  {
    title: "Implante Dentário",
    desc: "Implante unitário ou múltiplos para repor dentes perdidos com aparência natural e função duradoura.",
    icon: Cog,
  },
  {
    title: "Ortodontia e Aparelho",
    desc: "Aparelho ortodôntico fixo para alinhar os dentes e corrigir a mordida, com acompanhamento personalizado.",
    icon: AlignHorizontalDistributeCenter,
  },
  {
    title: "Alinhador Invisível",
    desc: "Tratamento ortodôntico transparente, removível e discreto — ideal para quem busca estética durante o tratamento.",
    icon: Sparkles,
  },
  {
    title: "Clareamento Dental",
    desc: "Clareamento profissional realizado em consultório ou supervisionado, para um sorriso mais branco com segurança.",
    icon: Sun,
  },
  {
    title: "Lente de Contato e Facetas",
    desc: "Facetas em resina ou porcelana e lentes de contato dental para redesenhar o sorriso com harmonia e naturalidade.",
    icon: Gem,
  },
  {
    title: "Harmonização Facial",
    desc: "Procedimentos estéticos faciais que valorizam o sorriso e o contorno do rosto, com foco em resultados naturais.",
    icon: Wand2,
  },
  {
    title: "Tratamento de Canal",
    desc: "Endodontia com técnicas modernas para preservar o dente natural, aliviar a dor e devolver a função.",
    icon: Activity,
  },
  {
    title: "Limpeza e Restauração",
    desc: "Consulta, profilaxia, restauração de resina e tratamento de cárie para manter a saúde bucal em dia.",
    icon: Brush,
  },
  {
    title: "Urgência Odontológica",
    desc: "Dor de dente, fratura ou trauma? Atendemos situações urgentes com rapidez e cuidado.",
    icon: Siren,
  },
];

const Services = () => {
  return (
    <section id="servicos" className="py-20 lg:py-28 bg-background">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wide">
            Especialidades
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
            Odontologia completa em Bauru para cada fase do seu sorriso
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mt-4">
            Tratamentos personalizados após avaliação — do preventivo à reabilitação
            estética e funcional, com atendimento humanizado.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: (i % 3) * 0.05 }}
                className="group bg-card rounded-2xl p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-6 h-6 text-primary" strokeWidth={1.75} />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-lg leading-snug">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                  {service.desc}
                </p>
                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track="whatsapp-click"
                  data-event="clique_whatsapp"
                  data-channel="whatsapp"
                  onClick={() => { void trackWhatsappClick(`Serviço — ${service.title}`, WA_URL); }}
                  className="text-primary text-sm font-semibold hover:underline mt-auto self-start"
                >
                  Saiba mais →
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
