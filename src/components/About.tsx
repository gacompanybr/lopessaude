import { motion } from "framer-motion";
import { GraduationCap, Award, Heart } from "lucide-react";
import draKaren from "@/assets/dra-karen-lopes.png.asset.json";
import { trackWhatsappClick } from "@/lib/trackWhatsappClick";

const WA_URL =
  "https://api.whatsapp.com/send?phone=5514996684609&text=Ol%C3%A1%20vim%20do%20site%20e%20gostaria%20de%20agendar%20uma%20avalia%C3%A7%C3%A3o";

const About = () => {
  return (
    <section id="sobre" className="py-20 lg:py-28 bg-card">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img
              src={draKaren.url}
              alt="Dra. Karen Lopes — Lopes Saúde e Odontologia em Bauru"
              className="w-full h-[460px] object-cover object-left rounded-3xl shadow-sm"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur rounded-2xl px-5 py-4 shadow-md">
              <p className="font-bold text-foreground text-sm">Dra. Karen Cristina Costa Lopes Aleixo</p>
              <p className="text-xs text-muted-foreground">CROSP 94468 · Responsável Técnica · CROSP-CL 13231</p>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wide">
              Conheça a Dra. Karen Lopes
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-6">
              Cuidando de sorrisos em Bauru desde 2007
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-[15px]">
              <p>
                "Sou a Dra. Karen Lopes, cirurgiã-dentista formada em 2007. Desde então,
                dedico minha carreira a oferecer um atendimento próximo, ético e humano
                para cada paciente que passa pelo consultório."
              </p>
              <p>
                "Com o passar dos anos, aprofundei minha formação em prótese dentária,
                ortodontia e alinhadores invisíveis — áreas que unem função e estética,
                e que amo praticar. Em 2013 fundamos a Lopes Saúde e Odontologia para
                atender Bauru e região com estrutura completa e uma equipe que compartilha
                dessa mesma paixão pelo cuidado."
              </p>
              <p>
                "Aqui, cada plano de tratamento é único: começa por uma avaliação
                cuidadosa e caminha no seu ritmo, com transparência sobre etapas, prazos e
                valores."
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              {[
                { icon: GraduationCap, label: "Desde 2007", sub: "Atuação clínica" },
                { icon: Award, label: "CROSP 94468", sub: "Responsável Técnica" },
                { icon: Heart, label: "Atendimento", sub: "Humanizado" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="bg-background rounded-xl p-4">
                    <Icon className="w-5 h-5 text-primary mb-2" strokeWidth={1.75} />
                    <p className="font-bold text-foreground text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                );
              })}
            </div>

            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-track="whatsapp-click"
              data-event="clique_whatsapp"
              data-channel="whatsapp"
              onClick={() => { void trackWhatsappClick("Sobre — Agende sua avaliação", WA_URL); }}
              className="inline-block mt-8 bg-primary text-primary-foreground px-8 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Agende sua avaliação
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
