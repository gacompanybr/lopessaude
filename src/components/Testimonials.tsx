import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "Paulo Araújo", text: "Ótimo atendimento, gostei muito. Recomendo." },
  { name: "Julio Ardengue", text: "Ótimo atendimento, super receptiva e atenciosa." },
  { name: "Kauã Dias", text: "Excelente atendimento! Recomendo!! 🙏🏼" },
  { name: "Caio Henrique", text: "Excelente atendimento e profissionalismo!!" },
  { name: "Tayla Fernanda", text: "Muito simpática, um amor de pessoa. Ótimo atendimento." },
  { name: "Lucineia Marciano", text: "Gosto muito do atendimento e indico." },
  { name: "Elisângela Cristina", text: "Excelente atendimento! 🙏🥰" },
  { name: "Ester Fernanda", text: "Excelente profissional, recomendo." },
  { name: "José Eduardo", text: "Ótimo atendimento!!" },
];

const Testimonials = () => {
  return (
    <section id="depoimentos" className="py-20 lg:py-28 bg-background">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wide">
            Depoimentos
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
            O que nossos pacientes dizem
          </h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Avaliações reais de pacientes no Google
            </p>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.05 }}
              className="bg-card rounded-2xl p-6 shadow-sm relative"
            >
              <Quote className="absolute top-5 right-5 w-6 h-6 text-primary/15" />
              <div className="flex mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-5">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">Paciente · Google</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
