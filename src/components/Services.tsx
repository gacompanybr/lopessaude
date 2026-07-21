import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { trackWhatsappClick } from "@/lib/trackWhatsappClick";

const WA_URL =
  "https://api.whatsapp.com/send?phone=5514996684609&text=Ol%C3%A1%20vim%20do%20site%20e%20gostaria%20de%20conhecer%20os%20tratamentos";

const cards = [
  {
    title: "Clínica Geral",
    desc: "O ponto de partida para um sorriso saudável: consulta, limpeza, restauração estética, clareamento e atendimento de urgências.",
    tone: "bg-card text-foreground",
  },
  {
    title: "Ortodontia",
    desc: "Alinhamento e correção do sorriso para todas as idades, com aparelhos fixos metálicos ou estéticos.",
    tone: "bg-primary text-primary-foreground",
  },
  {
    title: "Prótese e Protocolo",
    desc: "Prótese fixa, removível, dentadura e protocolo sobre implantes — reabilitação oral sob medida para conforto e mastigação natural.",
    tone: "bg-secondary text-foreground",
  },
  {
    title: "Implante Dentário",
    desc: "Implantes unitários e múltiplos para repor dentes perdidos com aparência natural e função duradoura.",
    tone: "bg-primary/10 text-foreground",
  },
];

const bullets = [
  "Atendimento humanizado e individualizado",
  "Estrutura moderna e ambiente acolhedor",
  "Tratamentos que unem saúde, estética e bem-estar",
];

const Services = () => {
  return (
    <section id="servicos" className="py-20 lg:py-28 bg-background">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: description */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:sticky lg:top-28"
          >
            <p className="text-primary font-semibold text-sm mb-3 uppercase tracking-wider">
              Nossos serviços
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-tight mb-6">
              Uma experiência que une excelência e cuidado humano
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-6">
              Nossa clínica foi pensada para te receber com carinho, conforto e
              atenção. Cada paciente é atendido de forma única, com tratamentos
              que unem ciência, saúde bucal e bem-estar — para você conquistar um
              sorriso que transmita confiança e autoestima.
            </p>
            <ul className="space-y-3 mb-8">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                  </div>
                  <span className="text-foreground text-[15px]">{b}</span>
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
              onClick={() => { void trackWhatsappClick("Serviços — Conheça tratamentos", WA_URL); }}
              className="inline-block bg-primary text-primary-foreground px-8 py-3.5 text-sm font-bold rounded-full hover:opacity-90 transition-opacity"
            >
              Conheça todos os tratamentos
            </a>
          </motion.div>

          {/* Right: staggered cards */}
          <div className="grid gap-5 lg:pt-8">
            {cards.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`${c.tone} rounded-3xl p-8 shadow-sm ${
                  i % 2 === 1 ? "lg:ml-10" : "lg:mr-10"
                }`}
              >
                <h3 className="text-xl sm:text-2xl font-bold mb-3 leading-snug">
                  {c.title}
                </h3>
                <p className="text-sm leading-relaxed opacity-90">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
