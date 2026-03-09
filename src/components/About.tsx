import { motion } from "framer-motion";
import clinicInterior from "@/assets/clinic-interior.jpg";

const About = () => {
  return (
    <section id="sobre" className="py-20 lg:py-28">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-badge mb-4">Nossa História</span>
            <h2 className="section-title mb-6">
              Tradição e <span className="gradient-text">excelência</span> desde 2013
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                A clínica Lopes Saúde e Odontologia surgiu em 2013 com o sonho de atender todas as pessoas da cidade de Duartina e região, onde a Dra. Karen Cristina Costa Lopes Aleixo já atendia desde 2007, mas somente com um consultório.
              </p>
              <p>
                Hoje, temos uma clínica completa. Localizados na Avenida São Paulo, 227, no centro de Duartina, a clínica conta com 3 consultórios para atendimento, uma recepção confortável e climatizada, salas com o máximo de conforto e qualidade, além de uma equipe qualificada e dedicada.
              </p>
            </div>
            <a
              href="https://api.whatsapp.com/send?phone=5514996684609"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-8 inline-flex"
            >
              Conheça nossa equipe
            </a>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={clinicInterior}
                alt="Interior moderno da Clínica Lopes Saúde"
                className="w-full h-[400px] object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
