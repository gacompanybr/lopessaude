import { motion } from "framer-motion";
import { ShieldCheck, BadgeDollarSign, Microscope, ArrowRight } from "lucide-react";
import patientSmile from "@/assets/patient-smile.jpg";

const features = [
  {
    icon: ShieldCheck,
    title: "Garantia Vitalícia",
    desc: "Entendemos que um tratamento odontológico é um investimento para a vida toda. Por isso, oferecemos garantia vitalícia para os nossos implantes dentários.",
  },
  {
    icon: BadgeDollarSign,
    title: "Informações sobre Valores",
    desc: "A Lopes Saúde é uma clínica particular, com valores acessíveis e opções de pagamento. Para saber o valor do seu atendimento, fale com nossa equipe.",
  },
  {
    icon: Microscope,
    title: "Avaliação Especializada",
    desc: "Utilizamos tecnologias avançadas para garantir uma avaliação precisa e detalhada, com plano de tratamento personalizado para cada paciente.",
  },
];

const Differentials = () => {
  return (
    <section id="diferenciais" className="py-20 lg:py-28 bg-card">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={patientSmile}
                alt="Paciente sorrindo após tratamento odontológico"
                className="w-full h-[450px] object-cover"
              />
            </div>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -right-4 glass-card p-5"
            >
              <p className="text-sm font-semibold text-foreground">Acompanhamento</p>
              <p className="text-xs text-muted-foreground">Pré e pós cirúrgico</p>
            </motion.div>
          </motion.div>

          {/* Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="section-badge mb-4">Diferenciais</span>
              <h2 className="section-title mb-4">
                Já pensou em poder se alimentar normalmente{" "}
                <span className="gradient-text">sem medo?</span>
              </h2>
              <p className="section-subtitle mb-10">
                Nosso objetivo é proporcionar a melhor experiência possível ao paciente, cuidando de cada detalhe para garantir o sucesso do tratamento.
              </p>
            </motion.div>

            <div className="space-y-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="flex gap-4 group"
                >
                  <div className="w-12 h-12 min-w-[48px] rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                    <feature.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-10"
            >
              <a href="#contato" className="btn-primary inline-flex">
                Quero minha avaliação
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Differentials;
