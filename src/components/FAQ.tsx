import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Quanto custa um implante dentário em Bauru?",
    a: "O valor do implante dentário varia conforme o caso — número de dentes, tipo de prótese sobre implante e necessidade de enxerto ósseo. Somos uma clínica particular em Bauru e informamos o valor personalizado após a avaliação. Fale com nossa equipe pelo WhatsApp para conhecer as condições e opções de pagamento parcelado.",
  },
  {
    q: "Qual a diferença entre prótese dentária e implante dentário?",
    a: "A prótese dentária repõe os dentes visíveis (pode ser fixa, removível ou total). O implante dentário é o pino de titânio fixado no osso que substitui a raiz do dente perdido — sobre ele é instalada uma coroa ou uma prótese protocolo. Em muitos casos usamos os dois em conjunto, na chamada reabilitação oral.",
  },
  {
    q: "O que é prótese protocolo?",
    a: "A prótese protocolo é uma prótese dentária fixa, aparafusada sobre 4 a 6 implantes dentários, que substitui toda a arcada. É indicada para quem perdeu vários dentes ou usa dentadura e busca uma solução fixa, estética e com mastigação próxima à natural.",
  },
  {
    q: "Alinhador invisível funciona mesmo? Dói?",
    a: "Sim, o alinhador invisível (transparente) corrige a maioria dos casos de dentes tortos, apinhamento e mordida com resultados equivalentes ao aparelho fixo. O desconforto é bem menor: há uma sensação de pressão nos primeiros dias de cada placa, sem os fios e bráquetes do aparelho tradicional.",
  },
  {
    q: "Quanto tempo dura o tratamento com aparelho ortodôntico ou alinhador?",
    a: "Depende do caso. Tratamentos simples com alinhador invisível podem durar de 6 a 12 meses; casos mais complexos com aparelho fixo ficam entre 18 e 30 meses em média. Na avaliação em Bauru você recebe uma previsão personalizada.",
  },
  {
    q: "Clareamento dental funciona e faz mal ao esmalte?",
    a: "O clareamento dental feito em clínica odontológica é seguro quando indicado por um dentista. Utilizamos protocolos controlados que preservam o esmalte. Alguns pacientes têm sensibilidade temporária, controlada com produtos dessensibilizantes.",
  },
  {
    q: "Lente de contato dental é durável?",
    a: "As lentes de contato dental (facetas de porcelana) têm alta durabilidade — em média 10 a 15 anos, podendo durar mais com cuidados adequados de higiene, uso de placa noturna em casos de bruxismo e revisões periódicas.",
  },
  {
    q: "Quanto tempo dura um implante dentário?",
    a: "Um implante dentário bem indicado e cuidado pode durar a vida toda. Oferecemos garantia vitalícia nos implantes realizados na clínica, condicionada às revisões e higiene bucal recomendadas.",
  },
  {
    q: "Vocês atendem urgência odontológica em Bauru?",
    a: "Sim. Para dor de dente, fratura, trauma ou pós-operatório, entre em contato pelo WhatsApp (14) 99668-4609 e nossa equipe encaixa seu atendimento com prioridade dentro do horário de funcionamento.",
  },
  {
    q: "Vale a pena escolher uma clínica odontológica particular em Bauru?",
    a: "Clínica particular oferece atendimento personalizado, escolha do profissional, tempo dedicado por consulta e materiais de sua preferência. Na Lopes Saúde oferecemos opções de pagamento facilitadas para tornar o tratamento acessível.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 lg:py-24 bg-background">
      <div className="section-container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-primary font-semibold text-sm mb-2">Dúvidas Frequentes</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
            Perguntas frequentes sobre dentista em Bauru
          </h2>
          <p className="text-muted-foreground text-sm mt-3">
            Atendemos Bauru e região: Duartina, Lençóis Paulista, Pederneiras, Bariri e Agudos.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((item, i) => (
            <div key={i} className="border border-border rounded-xl overflow-hidden bg-card">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                aria-expanded={open === i}
              >
                <span className="text-foreground font-semibold text-sm pr-4">{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-primary shrink-0 transition-transform duration-200 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </div>
    </section>
  );
};

export default FAQ;
