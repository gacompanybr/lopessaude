import { motion } from "framer-motion";
import { CalendarCheck, Search, Sparkles, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: CalendarCheck,
    num: "1",
    title: "Agendamento",
    desc: "Entre em contato conosco e agende sua consulta com facilidade, escolhendo o melhor dia e horário para você.",
  },
  {
    icon: Search,
    num: "2",
    title: "Avaliação",
    desc: "Vamos entender sua necessidade, realizar os primeiros exames e montar um plano personalizado para o seu sorriso.",
  },
  {
    icon: Sparkles,
    num: "3",
    title: "Início do Tratamento",
    desc: "Seguimos o plano acordado com você, com foco em resultado, conforto e excelência.",
  },
];

const HowWeWork = () => {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="section-badge mb-4">Como trabalhamos</span>
          <h2 className="section-title mb-4">
            Entenda como funciona o nosso atendimento
          </h2>
          <p className="section-subtitle mx-auto">
            Nosso processo é simples, eficiente e pensado para oferecer segurança e conforto em todas as etapas.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 left-[16.6%] right-[16.6%] h-px bg-border" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              className="relative text-center"
            >
              <div className="relative inline-flex mb-6">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-md relative z-10">
                  <step.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-card border-2 border-primary flex items-center justify-center text-xs font-bold text-primary z-20">
                  {step.num}
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <a href="#contato" className="btn-primary inline-flex">
            Agendar minha consulta
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HowWeWork;
