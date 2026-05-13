import { useEffect, useLayoutEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";

export type TourStep = {
  selector: string;
  title: string;
  body: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
};

const STORAGE_KEY = "lopes_crm_tour_done_v1";

export const CRM_TOUR_STEPS: TourStep[] = [
  {
    selector: "[data-tour='header']",
    title: "Bem-vindo ao CRM",
    body: "Centralize aqui o acompanhamento de todos os leads da Lopes Saúde, do primeiro contato à conversão.",
    placement: "bottom",
  },
  {
    selector: "[data-tour='new-lead']",
    title: "Novo lead",
    body: "Cadastre manualmente um lead que chegou por telefone, indicação ou outro canal.",
    placement: "bottom",
  },
  {
    selector: "[data-tour='stats']",
    title: "Indicadores rápidos",
    body: "Veja em tempo real o total de leads, novos, convertidos, perdidos e a taxa de conversão.",
    placement: "bottom",
  },
  {
    selector: "[data-tour='filters']",
    title: "Filtros e busca",
    body: "Refine por nome, status, origem ou período. Os indicadores e gráficos se ajustam aos filtros aplicados.",
    placement: "bottom",
  },
  {
    selector: "[data-tour='charts']",
    title: "Gráficos e indicadores",
    body: "Acompanhe a evolução mensal, status do funil, origem e cidades dos leads.",
    placement: "top",
  },
  {
    selector: "[data-tour='leads-list']",
    title: "Lista de leads",
    body: "Cada cartão mostra dados do paciente, status atual, origem e histórico de observações.",
    placement: "top",
  },
  {
    selector: "[data-tour='lead-status']",
    title: "Status do funil",
    body: "Atualize o status (Novo, Em contato, Agendado, Convertido, Perdido) após cada interação.",
    placement: "left",
  },
  {
    selector: "[data-tour='lead-edit']",
    title: "Editar lead",
    body: "Use o lápis para editar dados, alterar origem e adicionar observações internas.",
    placement: "left",
  },
  {
    selector: "[data-tour='exports']",
    title: "Exportações",
    body: "Gere relatórios em PDF ou Excel com base nos filtros ativos.",
    placement: "bottom",
  },
  {
    selector: "[data-tour='help']",
    title: "Reabrir o guia",
    body: "Clique aqui sempre que quiser rever este passo a passo. Bom trabalho!",
    placement: "bottom",
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  steps?: TourStep[];
}

const PADDING = 8;

const CrmTour = ({ open, onClose, steps = CRM_TOUR_STEPS }: Props) => {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Filter to steps whose target exists
  const visibleSteps = steps.filter((s) => document.querySelector(s.selector));
  const step = visibleSteps[index];

  const updateRect = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.selector) as HTMLElement | null;
    if (!el) {
      setRect(null);
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    // small delay to let scroll settle
    requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      setRect(r);
    });
  }, [step]);

  useLayoutEffect(() => {
    if (!open) return;
    updateRect();
  }, [open, index, updateRect]);

  useEffect(() => {
    if (!open) return;
    const handler = () => updateRect();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    const interval = setInterval(updateRect, 400);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
      clearInterval(interval);
    };
  }, [open, updateRect]);

  useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  if (!open || !step) return null;

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    onClose();
  };

  const next = () => {
    if (index >= visibleSteps.length - 1) finish();
    else setIndex((i) => i + 1);
  };
  const prev = () => setIndex((i) => Math.max(0, i - 1));

  // Tooltip positioning
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const TOOLTIP_W = Math.min(340, vw - 24);
  const TOOLTIP_H_EST = 200;

  let top = vh / 2 - TOOLTIP_H_EST / 2;
  let left = vw / 2 - TOOLTIP_W / 2;

  if (rect && step.placement !== "center") {
    const placement = step.placement || "bottom";
    if (placement === "bottom") {
      top = rect.bottom + 12;
      left = rect.left + rect.width / 2 - TOOLTIP_W / 2;
    } else if (placement === "top") {
      top = rect.top - TOOLTIP_H_EST - 12;
      left = rect.left + rect.width / 2 - TOOLTIP_W / 2;
    } else if (placement === "left") {
      top = rect.top + rect.height / 2 - TOOLTIP_H_EST / 2;
      left = rect.left - TOOLTIP_W - 12;
    } else if (placement === "right") {
      top = rect.top + rect.height / 2 - TOOLTIP_H_EST / 2;
      left = rect.right + 12;
    }
    // Fallback if no room above/below
    if (top < 12) top = rect.bottom + 12;
    if (top + TOOLTIP_H_EST > vh - 12) top = Math.max(12, rect.top - TOOLTIP_H_EST - 12);
  }
  // Clamp
  left = Math.max(12, Math.min(vw - TOOLTIP_W - 12, left));
  top = Math.max(12, Math.min(vh - 12 - 60, top));

  // Highlight box
  const highlight = rect
    ? {
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      }
    : null;

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      {/* Dim overlay with cutout via box-shadow */}
      {highlight ? (
        <div
          className="absolute rounded-xl pointer-events-none transition-all duration-300"
          style={{
            top: highlight.top,
            left: highlight.left,
            width: highlight.width,
            height: highlight.height,
            boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.65)",
            outline: "2px solid hsl(var(--primary))",
            outlineOffset: "2px",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-slate-900/65" />
      )}

      {/* Click-catcher to advance/skip on backdrop is intentional NOT — user uses buttons */}

      {/* Tooltip card */}
      <div
        className="absolute bg-card border border-border rounded-xl shadow-2xl p-5 pointer-events-auto"
        style={{ top, left, width: TOOLTIP_W }}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Passo {index + 1} de {visibleSteps.length}
            </span>
          </div>
          <button
            onClick={finish}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fechar guia"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <h3 className="font-display font-bold text-foreground text-base mb-1.5">
          {step.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {step.body}
        </p>
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={finish} className="text-muted-foreground">
            Pular guia
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prev}
              disabled={index === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Voltar
            </Button>
            <Button size="sm" onClick={next} className="gap-1">
              {index >= visibleSteps.length - 1 ? "Finalizar" : (
                <>Próximo <ChevronRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CrmTour;

export const CrmTourButton = ({ onOpen }: { onOpen: () => void }) => (
  <Button variant="secondary" size="sm" className="gap-2" onClick={onOpen}>
    <HelpCircle className="w-4 h-4" /> Guia do CRM
  </Button>
);

export const tourAlreadySeen = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return true;
  }
};
