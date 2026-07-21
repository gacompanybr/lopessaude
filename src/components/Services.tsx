import { motion } from "framer-motion";
import { Cross, Cog, Smile, Microscope } from "lucide-react";

const services = [
  {
    title: "Clínica Geral em Bauru",
    desc: "Consulta odontológica, limpeza dental (profilaxia), restauração de resina e tratamento de cárie para manter sua saúde bucal em dia em Bauru e região.",
    icon: <Cross className="w-8 h-8 text-primary" strokeWidth={1.5} />,
  },
  {
    title: "Implante Dentário em Bauru",
    desc: "Implantodontia com implante dentário unitário ou protocolo dentário fixo para repor dentes perdidos com estética natural e mastigação confortável.",
    icon: <Cog className="w-8 h-8 text-primary" strokeWidth={1.5} />,
  },
  {
    title: "Prótese Dentária em Bauru",
    desc: "Prótese dentária fixa, removível, prótese total (dentadura) e prótese sobre implante — reabilitação oral sob medida para conforto e sorriso natural.",
    icon: <Smile className="w-8 h-8 text-primary" strokeWidth={1.5} />,
  },
  {
    title: "Ortodontia, Endodontia e Estética",
    desc: "Aparelho ortodôntico fixo, alinhador invisível (transparente), tratamento de canal (endodontia), extração de siso, clareamento dental e lente de contato dental em Bauru.",
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
          <p className="text-primary font-semibold text-sm mb-2">Tratamentos odontológicos em Bauru</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight max-w-2xl mx-auto">
            Odontologia completa em Bauru: implante, prótese, ortodontia e estética do sorriso
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mt-4">
            Somos uma clínica odontológica particular referência em Bauru e região, com atendimento humanizado e plano de tratamento personalizado após avaliação especializada.
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
              className="bg-card rounded-2xl p-6 shadow-sm text-center"
            >
              <div className="flex justify-center mb-4">{service.icon}</div>
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
