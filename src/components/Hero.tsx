import { motion } from "framer-motion";
import { CalendarDays, Clock, Siren } from "lucide-react";
import { trackWhatsappClick } from "@/lib/trackWhatsappClick";

const WA_URL =
  "https://api.whatsapp.com/send?phone=5514996684609&text=Ol%C3%A1%20vim%20do%20site%20e%20gostaria%20de%20agendar%20uma%20avalia%C3%A7%C3%A3o";

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
              <p className="text-primary font-semibold text-sm mb-3 tracking-wide uppercase">
                Clínica Odontológica em Bauru
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-tight mb-5">
                Transformando sorrisos em Bauru com saúde, estética e confiança.
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-md">
                Atendimento humanizado em prótese, protocolo, implante dentário,
                ortodontia e alinhadores invisíveis — plano de tratamento
                personalizado após avaliação.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track="whatsapp-click"
                  data-event="clique_whatsapp"
                  data-channel="whatsapp"
                  onClick={() => { void trackWhatsappClick("Hero — Agende sua avaliação", WA_URL); }}
                  className="inline-block bg-primary text-primary-foreground px-10 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity rounded-xl"
                >
                  Agende sua avaliação
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
                alt="Clínica Lopes Saúde e Odontologia - Fachada em Bauru"
                className="w-full h-full object-cover lg:scale-125"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="section-container pb-16">
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              title: "Agendamentos",
              desc: "Horários flexíveis e equipe preparada para te receber com conforto e pontualidade.",
              highlight: "Seg-Sex: 8h–18h",
              icon: <CalendarDays className="w-7 h-7 text-primary" strokeWidth={1.5} />,
            },
            {
              title: "Funcionamento",
              desc: "Segunda a Sexta: 8h às 18h · Sábado: 8h às 12h · Domingo: Fechado",
              highlight: "Sábado: 8h–12h",
              icon: <Clock className="w-7 h-7 text-primary" strokeWidth={1.5} />,
            },
            {
              title: "Urgência",
              desc: "Dor de dente, fratura ou trauma? Fale conosco pelo WhatsApp e atendemos com rapidez.",
              highlight: "(14) 99668-4609",
              icon: <Siren className="w-7 h-7 text-primary" strokeWidth={1.5} />,
            },
          ].map((item) => (
            <div key={item.title} className="bg-card rounded-2xl p-6 shadow-sm">
              <div className="mb-3">{item.icon}</div>
              <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.desc}</p>
              <span className="text-sm font-semibold text-primary">{item.highlight}</span>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-track="whatsapp-click"
            data-event="clique_whatsapp"
            data-channel="whatsapp"
            onClick={() => { void trackWhatsappClick("Cards — Agende sua avaliação", WA_URL); }}
            className="inline-block bg-primary text-primary-foreground px-10 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity rounded-xl"
          >
            Agende sua avaliação
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
