import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

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
    <section className="bg-primary">
      <div className="section-container py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl lg:text-4xl font-display font-bold text-primary-foreground mb-1">
                <Counter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-primary-foreground/70 text-xs font-semibold uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
