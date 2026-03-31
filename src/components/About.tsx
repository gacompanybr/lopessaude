import { motion } from "framer-motion";
import clinicInterior from "@/assets/clinic-interior.jpg";

const About = () => {
  return (
    <section id="sobre" className="py-16 lg:py-24 bg-card">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <img
              src={clinicInterior}
              alt="Interior da Clínica Lopes Saúde"
              className="w-full h-[360px] object-cover rounded-2xl"
            />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-primary font-semibold text-sm mb-2">Nossa História</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-6">
              Nossa História
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
              <p>
                A clínica Lopes Saúde e Odontologia surgiu em 2013 com o sonho de atender todas as pessoas da cidade de Duartina e região, onde a Dra. Karen Cristina Costa Lopes Aleixo já atendia desde 2007, mas somente com um consultório.
              </p>
              <p>
                Hoje em 2024, temos uma clínica completa. Localizados na Avenida São Paulo, 227, no centro de Duartina, a clínica conta com 3 consultórios para atendimento, uma recepção confortável e climatizada, salas com o máximo de conforto e qualidade, além de uma equipe qualificada e dedicada.
              </p>
            </div>
            <a
              href="#contato"
              className="inline-block mt-6 text-primary font-semibold text-sm hover:underline"
            >
              Conheça nossa equipe →
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
