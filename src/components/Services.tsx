import { motion } from "framer-motion";
import { Stethoscope, Smile, CircleDot, Shield, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Stethoscope,
    title: "Clínica Geral",
    desc: "Consultas, limpezas, restaurações e diagnósticos completos para manter a sua saúde bucal sempre em dia.",
  },
  {
    icon: CircleDot,
    title: "Implante Dentário",
    desc: "Soluções modernas e seguras para repor dentes perdidos e devolver estética, mastigação e confiança no sorriso.",
  },
  {
    icon: Smile,
    title: "Prótese Dentária",
    desc: "Próteses sob medida que garantem conforto, funcionalidade e aparência natural para sua nova dentição.",
  },
  {
    icon: Shield,
    title: "Ortodontia, Exodontia e Endodontia",
    desc: "Tratamentos ortodônticos, extrações e canais realizados com precisão, tecnologia e foco no bem-estar do paciente.",
  },
];

const Services = () => {
  return (
    <section id="servicos" className="py-20 lg:py-28 bg-card">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="section-badge mb-4">Nossos serviços</span>
          <h2 className="section-title mb-4">
            Descubra todos os cuidados que oferecemos
          </h2>
          <p className="section-subtitle mx-auto">
            Transformamos seu sorriso e cuidamos da sua saúde bucal com carinho e excelência.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="card-elevated p-8 text-center group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary transition-colors duration-300">
                <service.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">{service.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a href="#contato" className="btn-primary inline-flex">
            Agendar minha consulta
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
