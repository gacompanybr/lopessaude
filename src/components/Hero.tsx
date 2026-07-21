import { motion } from "framer-motion";
import { CalendarDays, Clock, Siren } from "lucide-react";
import { trackWhatsappClick } from "@/lib/trackWhatsappClick";

const Hero = () => {
  return (
    <section className="bg-background">
      {/* Schedule strip */}
      <div className="section-container py-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center text-xs sm:text-sm items-start">
          <div className="flex flex-col">
            <p className="text-muted-foreground leading-tight">Segunda a Sexta</p>
            <p className="font-semibold text-foreground whitespace-nowrap">8h às 18h</p>
          </div>
          <div className="flex flex-col">
            <p className="text-muted-foreground leading-tight">Sábado</p>
            <p className="font-semibold text-foreground whitespace-nowrap">8h às 12h</p>
          </div>
          <div className="flex flex-col">
            <p className="text-muted-foreground leading-tight">Domingo</p>
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
              className="px-8 lg:px-14 pt-12 pb-8 lg:py-20"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-tight mb-5">
                Dentista em Bauru:<br />seu sorriso é nossa prioridade
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-md">
                Clínica odontológica particular em Bauru e região — atendimento humanizado em implante dentário, prótese, ortodontia, alinhador invisível e estética do sorriso.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://api.whatsapp.com/send?phone=5514996684609&text=Ol%C3%A1%20vim%20do%20site%20e%20gostaria%20de%20agendar%20uma%20consulta"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track="whatsapp-click"
                  data-event="clique_whatsapp"
                  data-channel="whatsapp"
                  onClick={() => { void trackWhatsappClick("Hero — Agendar Consulta", "https://api.whatsapp.com/send?phone=5514996684609"); }}
                  className="inline-block bg-primary text-primary-foreground px-10 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity rounded-xl"
                >
                  Agendar Consulta
                </a>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="relative h-full min-h-[300px] lg:min-h-[420px]"
            >
              <img
                src="/clinic-facade.png"
                alt="Clínica Lopes Saúde e Odontologia - Fachada"
                className="w-full h-full object-cover lg:scale-125"
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
              icon: <CalendarDays className="w-7 h-7 text-primary" strokeWidth={1.5} />,
            },
            {
              title: "Funcionamento",
              desc: "Segunda a Sexta: 8h00 às 18h00 · Sábado: 8h00 às 12h00 · Domingo: Fechado",
              highlight: "Sábado: 8h–12h",
              icon: <Clock className="w-7 h-7 text-primary" strokeWidth={1.5} />,
            },
            {
              title: "Emergência",
              desc: "Para situações urgentes, estamos disponíveis para te atender com rapidez e segurança.",
              highlight: "(14) 99668-4609",
              icon: <Siren className="w-7 h-7 text-primary" strokeWidth={1.5} />,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-card rounded-2xl p-6 shadow-sm"
            >
              <div className="mb-3">{item.icon}</div>
              <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.desc}</p>
              <span className="text-sm font-semibold text-primary">{item.highlight}</span>
            </div>
          ))}
        </div>
        <div className="text-center mt-8 flex flex-col items-center gap-3">
          <a
            href="https://api.whatsapp.com/send?phone=5514996684609&text=Ol%C3%A1%20vim%20do%20site%20e%20gostaria%20de%20agendar%20uma%20consulta"
            target="_blank"
            rel="noopener noreferrer"
            data-track="whatsapp-click"
            data-event="clique_whatsapp"
            data-channel="whatsapp"
            onClick={() => { void trackWhatsappClick("Cards — Agendar agora", "https://api.whatsapp.com/send?phone=5514996684609"); }}
            className="inline-block bg-primary text-primary-foreground px-10 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity rounded-xl"
          >
            Agendar agora
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
