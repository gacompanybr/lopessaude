import { motion } from "framer-motion";
import { Cross, Cog, Smile, Microscope } from "lucide-react";

const services = [
  {
    title: "Clínica Geral",
    desc: "Consultas, limpezas, restaurações e diagnósticos completos para manter a sua saúde bucal sempre em dia.",
    icon: <Cross className="w-8 h-8 text-primary" strokeWidth={1.5} />,
  },
  {
    title: "Implante Dentário",
    desc: "Soluções modernas e seguras para repor dentes perdidos e devolver estética, mastigação e confiança no sorriso.",
    icon: <Cog className="w-8 h-8 text-primary" strokeWidth={1.5} />,
  },
  {
    title: "Prótese Dentária",
    desc: "Próteses sob medida que garantem conforto, funcionalidade e aparência natural para sua nova dentição.",
    icon: <Smile className="w-8 h-8 text-primary" strokeWidth={1.5} />,
  },
  {
    title: "Ortodontia, Exodontia e Endodontia",
    desc: "Tratamentos ortodônticos, extrações e canais realizados com precisão, tecnologia e foco no bem-estar do paciente.",
    icon: <Microscope className="w-8 h-8 text-primary" strokeWidth={1.5} />,
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
          className="text-center mb-14"
        >
          <p className="text-primary font-semibold text-sm mb-2">Nossos serviços</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight max-w-2xl mx-auto">
            Descubra todos os cuidados que oferecemos para transformar seu sorriso
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-card rounded-2xl p-6 shadow-sm text-center"
            >
              <div className="mb-4">{service.icon}</div>
              <h3 className="font-bold text-foreground mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
