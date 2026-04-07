import { motion } from "framer-motion";
import clinicHero from "@/assets/clinic-hero.jpg";

const Hero = () => {
  return (
    <section className="bg-background">
      {/* Schedule strip */}
      <div className="section-container py-4">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-muted-foreground">Segunda a Sexta</p>
            <p className="font-semibold text-foreground">8h00 às 18h00</p>
          </div>
          <div>
            <p className="text-muted-foreground">Sábado</p>
            <p className="font-semibold text-foreground">8h00 às 12h00</p>
          </div>
          <div>
            <p className="text-muted-foreground">Domingo</p>
            <p className="font-semibold text-foreground">Fechado</p>
          </div>
        </div>
      </div>

      {/* Hero card */}
      <div className="section-container pb-8">
        <div className="bg-card rounded-3xl overflow-hidden shadow-sm">
          <div className="grid lg:grid-cols-2 gap-0 items-center">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="px-8 lg:px-14 py-12 lg:py-20"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-tight mb-5">
                Seu sorriso é<br />nossa prioridade
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-md">
                Cuidamos da sua saúde bucal com atenção, carinho e tecnologia, para que você sorria com confiança todos os dias.
              </p>
              <a
                href="#contato"
                className="inline-block bg-primary text-primary-foreground px-10 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity rounded-xl"
              >
                Atendimento particular
              </a>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="relative h-full min-h-[300px] lg:min-h-[420px]"
            >
              <img
                src={clinicHero}
                alt="Clínica Lopes Saúde e Odontologia - Fachada"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="section-container pb-12">
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              title: "Agendamentos",
              desc: "Facilitamos seu atendimento com horários flexíveis e equipe preparada para te receber com conforto e pontualidade.",
              highlight: "Seg-Sex: 8h–18h",
              icon: "📅",
            },
            {
              title: "Funcionamento",
              desc: "Segunda a Sexta: 8h00 às 18h00 · Sábado: 8h00 às 12h00 · Domingo: Fechado",
              highlight: "Sábado: 8h–12h",
              icon: "🕐",
            },
            {
              title: "Emergência",
              desc: "Para situações urgentes, estamos disponíveis para te atender com rapidez e segurança.",
              highlight: "(14) 99668-4609",
              icon: "🚨",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-card rounded-2xl p-6 shadow-sm"
            >
              <div className="text-2xl mb-3">{item.icon}</div>
              <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.desc}</p>
              <span className="text-sm font-semibold text-primary">{item.highlight}</span>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <a
            href="#contato"
            className="inline-block bg-primary text-primary-foreground px-10 py-3.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Agendar agora
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
