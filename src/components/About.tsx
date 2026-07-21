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
            <p className="text-primary font-semibold text-sm mb-2">Clínica odontológica em Bauru e região</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-6">
              Nossa história como dentista particular em Bauru
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
              <p>
                A Lopes Saúde e Odontologia é uma clínica odontológica particular que atende Bauru e região desde 2013, com a Dra. Karen Cristina Costa Lopes Aleixo à frente do consultório desde 2007. Atendemos pacientes de Bauru, Duartina, Lençóis Paulista, Pederneiras, Bariri e Agudos.
              </p>
              <p>
                Nossa estrutura conta com 3 consultórios, recepção climatizada e equipe qualificada, oferecendo odontologia em Bauru com foco em implante dentário, prótese, ortodontia, alinhador invisível, clareamento dental e estética do sorriso — sempre com plano de tratamento personalizado após avaliação.
              </p>
            </div>
            <a
              href="#contato"
              className="inline-block mt-6 text-primary font-semibold text-sm hover:underline"
            >
              Agende sua avaliação em Bauru →
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
