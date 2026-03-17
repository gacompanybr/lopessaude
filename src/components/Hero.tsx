import { motion } from "framer-motion";
import { Calendar, Clock, AlertCircle, Phone, ArrowRight } from "lucide-react";
import clinicHero from "@/assets/clinic-hero.jpg";

const Hero = () => {
  return (
    <section className="relative bg-background">
      {/* Hero main */}
      <div className="section-container py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="section-title mb-6">
              Seu sorriso é{" "}
              <span className="gradient-text">nossa prioridade</span>
            </h1>
            <p className="section-subtitle mb-8">
              Cuidamos da sua saúde bucal com atenção, carinho e tecnologia, para que você sorria com confiança todos os dias.
            </p>
            <a href="#contato" className="btn-primary">
              Atendimento particular
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src={clinicHero}
                alt="Clínica Lopes Saúde e Odontologia - Fachada moderna"
                className="w-full h-[380px] lg:h-[460px] object-cover"
              />
            </div>
            {/* Floating phone card */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 glass-card p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Phone className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">(14) 99668-4609</p>
                <p className="text-xs text-muted-foreground">Ligue agora</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Info cards */}
      <div className="section-container pb-16">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: Calendar,
              title: "Agendamentos",
              desc: "Facilitamos seu atendimento com horários flexíveis e equipe preparada para te receber com conforto e pontualidade.",
              highlight: "Seg-Sex: 8h–18h",
            },
            {
              icon: Clock,
              title: "Funcionamento",
              desc: "Segunda a Sexta: 8h00 às 18h00 · Sábado: 8h00 às 12h00 · Domingo: Fechado",
              highlight: "Sábado: 8h–12h",
            },
            {
              icon: AlertCircle,
              title: "Emergência",
              desc: "Para situações urgentes, estamos disponíveis para te atender com rapidez e segurança.",
              highlight: "(14) 99668-4609",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="card-elevated p-6 group"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-300">
                <item.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{item.desc}</p>
              <span className="text-sm font-semibold text-primary">{item.highlight}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
