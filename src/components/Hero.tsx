import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import clinicHero from "@/assets/clinic-hero.jpg";

const Hero = () => {
  return (
    <section className="bg-background">
      <div className="section-container py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-primary font-semibold text-sm mb-3 uppercase tracking-wide">
              Clínica Odontológica em Duartina - SP
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-5">
              Seu sorriso é nossa prioridade
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-lg">
              Cuidamos da sua saúde bucal com atenção, carinho e tecnologia, para que você sorria com confiança todos os dias.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#contato" className="btn-primary">
                Agendar consulta
                <ArrowRight className="w-4 h-4" />
              </a>
              <a href="tel:+5514996684609" className="btn-outline">
                <Phone className="w-4 h-4" />
                (14) 99668-4609
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="rounded-xl overflow-hidden">
              <img
                src={clinicHero}
                alt="Clínica Lopes Saúde e Odontologia"
                className="w-full h-[340px] lg:h-[420px] object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Info strip */}
      <div className="bg-card border-y border-border">
        <div className="section-container py-6">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { label: "Seg–Sex", value: "8h às 18h" },
              { label: "Sábado", value: "8h às 12h" },
              { label: "Emergência", value: "(14) 99668-4609" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
