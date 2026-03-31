import { motion } from "framer-motion";
import { CalendarCheck, Search, Sparkles } from "lucide-react";

const steps = [
  {
    icon: CalendarCheck,
    num: "01",
    title: "Agendamento",
    desc: "Entre em contato e agende sua consulta no melhor dia e horário para você.",
  },
  {
    icon: Search,
    num: "02",
    title: "Avaliação",
    desc: "Realizamos exames e montamos um plano personalizado para seu sorriso.",
  },
  {
    icon: Sparkles,
    num: "03",
    title: "Tratamento",
    desc: "Seguimos o plano com foco em resultado, conforto e excelência.",
  },
];

const HowWeWork = () => {
  return (
    <section className="py-16 lg:py-24 bg-card">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="section-badge mb-3">Como funciona</span>
          <h2 className="section-title mb-3">Nosso atendimento em 3 passos</h2>
          <p className="section-subtitle mx-auto">
            Processo simples e eficiente para seu conforto.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Passo {step.num}</span>
              <h3 className="font-bold text-foreground mt-2 mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowWeWork;
