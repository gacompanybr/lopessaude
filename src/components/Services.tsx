import { motion } from "framer-motion";
import { Stethoscope, Smile, CircleDot, Shield, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Stethoscope,
    title: "Clínica Geral",
    desc: "Consultas, limpezas, restaurações e diagnósticos para manter sua saúde bucal em dia.",
  },
  {
    icon: CircleDot,
    title: "Implante Dentário",
    desc: "Soluções seguras para repor dentes perdidos e devolver estética e confiança.",
  },
  {
    icon: Smile,
    title: "Prótese Dentária",
    desc: "Próteses sob medida com conforto, funcionalidade e aparência natural.",
  },
  {
    icon: Shield,
    title: "Ortodontia e Endodontia",
    desc: "Tratamentos ortodônticos, extrações e canais com precisão e conforto.",
  },
];

const Services = () => {
  return (
    <section id="servicos" className="py-16 lg:py-24 bg-background">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="section-badge mb-3">Nossos serviços</span>
          <h2 className="section-title mb-3">Cuidados que oferecemos</h2>
          <p className="section-subtitle mx-auto">
            Tratamentos completos para transformar seu sorriso com segurança.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="card-elevated p-6 text-center"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <service.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2 text-sm">{service.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a href="#contato" className="btn-primary">
            Agendar minha consulta
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Services;
