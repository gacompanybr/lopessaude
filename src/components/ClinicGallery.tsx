import { motion } from "framer-motion";
import pinkRoom from "@/assets/clinic-pink-room.jpg.asset.json";
import reception from "@/assets/clinic-reception.jpg.asset.json";
import office from "@/assets/clinic-office.jpg.asset.json";

const photos = [
  { src: reception.url, alt: "Recepção da clínica Lopes Saúde em Bauru", label: "Recepção" },
  { src: office.url, alt: "Consultório da Dra. Karen Lopes em Bauru", label: "Consultório" },
  { src: pinkRoom.url, alt: "Sala de espera aconchegante da Lopes Saúde", label: "Sala de espera" },
];

const ClinicGallery = () => {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wide">
            Nossa estrutura
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
            Um ambiente pensado para o seu conforto
          </h2>
          <p className="text-muted-foreground text-base mt-4 leading-relaxed">
            Espaços modernos, acolhedores e equipados com tecnologia para uma
            experiência tranquila do primeiro contato ao pós-atendimento.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-5">
          {photos.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative rounded-2xl overflow-hidden group shadow-sm"
            >
              <img
                src={p.src}
                alt={p.alt}
                className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <p className="absolute bottom-4 left-4 text-white font-semibold text-sm uppercase tracking-wider">
                {p.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClinicGallery;
