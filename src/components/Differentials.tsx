import { motion } from "framer-motion";
import { Hospital, Banknote, ShieldCheck, Search } from "lucide-react";
import beforeAfter1 from "@/assets/teeth-restoration.jpg.asset.json";
import beforeAfter2 from "@/assets/whitening.jpg.asset.json";
import beforeAfter3 from "@/assets/braces-before-after.png.asset.json";

const features = [
  {
    title: "ACOMPANHAMENTO PRÉ E PÓS CIRÚRGICO",
    desc: "Nosso objetivo é proporcionar a melhor experiência possível ao paciente, cuidando de cada detalhe para garantir o sucesso do tratamento.",
    icon: <Hospital className="w-6 h-6 text-primary" strokeWidth={1.5} />,
  },
  {
    title: "INFORMAÇÕES SOBRE VALORES",
    desc: "A Lopes Saúde é uma clínica particular. Para saber o valor do seu atendimento, fale com nossa equipe pelo WhatsApp.",
    icon: <Banknote className="w-6 h-6 text-primary" strokeWidth={1.5} />,
  },
  {
    title: "GARANTIA VITALÍCIA",
    desc: "Entendemos que um tratamento odontológico é um investimento para a vida toda. Por isso, oferecemos garantia vitalícia para os nossos implantes dentários.",
    icon: <ShieldCheck className="w-6 h-6 text-primary" strokeWidth={1.5} />,
  },
  {
    title: "AVALIAÇÃO ESPECIALIZADA",
    desc: "Utilizamos tecnologias avançadas para garantir uma avaliação ainda mais precisa e detalhada, com plano de tratamento personalizado.",
    icon: <Search className="w-6 h-6 text-primary" strokeWidth={1.5} />,
  },
];

const Differentials = () => {
  return (
    <section id="diferenciais" className="py-16 lg:py-24 bg-background">
      <div className="section-container">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-primary leading-tight max-w-2xl">
            Por que escolher a Lopes Saúde como sua clínica odontológica?
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl mt-3">
            Dentista particular com garantia vitalícia em implantes, acompanhamento pré e pós-cirúrgico e opções de pagamento facilitadas. Também atendemos urgências odontológicas — dor de dente, fratura ou trauma — com rapidez e segurança.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 gap-8 mb-16">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-4"
            >
              <div className="mt-0.5">{feature.icon}</div>
              <div>
                <h3 className="font-bold text-foreground text-sm uppercase tracking-wide mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Before/After images */}
        <div className="grid sm:grid-cols-3 gap-5">
          {[beforeAfter1, beforeAfter2, beforeAfter3].map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-2xl overflow-hidden shadow-sm"
            >
              <img
                src={img.url}
                alt={`Resultado de tratamento ${i + 1}`}
                className="w-full h-56 object-cover"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Differentials;
