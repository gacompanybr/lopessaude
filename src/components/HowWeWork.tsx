import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import dentistPortrait from "@/assets/dentist-portrait.png";

const steps = [
  {
    num: "1",
    title: "Agendamento",
    desc: "Entre em contato conosco e agende sua consulta com facilidade, escolhendo o melhor dia e horário para você.",
  },
  {
    num: "2",
    title: "Avaliação",
    desc: "Vamos entender sua necessidade, realizar os primeiros exames e montar um plano personalizado para o seu sorriso.",
  },
  {
    num: "3",
    title: "Início do Tratamento",
    desc: "Seguimos o plano acordado com você, com foco em resultado, conforto e excelência.",
  },
];

const HowWeWork = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 lg:py-24 bg-card">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-primary font-semibold text-sm mb-2">Como trabalhamos</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-3">
              Entenda como funciona o nosso atendimento odontológico
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Nosso processo é simples, eficiente e pensado para oferecer segurança e conforto em todas as etapas do seu atendimento.
            </p>

            {/* Accordion */}
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className="border border-border rounded-xl overflow-hidden bg-background"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="text-primary font-semibold text-sm">
                      {step.num}. {step.title}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-primary transition-transform duration-200 ${
                        openIndex === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openIndex === i && (
                    <div className="px-5 pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Image side */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="hidden lg:block"
          >
            <img
              src={dentistPortrait}
              alt="Dentista profissional da Clínica Lopes"
              className="w-full h-[500px] object-cover rounded-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowWeWork;
