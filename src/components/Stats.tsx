import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

const stats = [
  { value: 900, suffix: "+", label: "Pacientes Atendidos" },
  { value: 175, suffix: "", label: "Avaliações 5 Estrelas" },
  { value: 545, suffix: "", label: "Casos de Sucesso" },
  { value: 245, suffix: "+", label: "Procedimentos Realizados" },
];

const Counter = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
};

const Stats = () => {
  return (
    <section className="py-16 gradient-bg">
      <div className="section-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-2">
                <Counter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-primary-foreground/80 text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <a href="#contato" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold bg-primary-foreground text-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
            Faça parte desses números
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Stats;
