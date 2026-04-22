import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Activity, ChevronLeft, TrendingUp } from "lucide-react";
import type { Lead, LeadTagOrigem } from "@/lib/leads";

// Paleta padronizada para Aquisição (HSL — alinhada com a identidade visual)
const ACQ_COLORS = {
  organico: "hsl(152, 60%, 42%)",   // verde
  pago: "hsl(231, 70%, 56%)",        // indigo agregado
  meta_ads: "hsl(262, 70%, 58%)",    // roxo Meta
  google_ads: "hsl(38, 92%, 52%)",   // amarelo Google
} as const;

type View = "overview" | "paid";

const PaidTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-xl border border-border bg-card/95 backdrop-blur shadow-lg px-3 py-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.payload.fill }} />
        <span className="font-display font-semibold text-foreground">{p.name}</span>
      </div>
      <div className="mt-1 text-muted-foreground">
        <span className="font-semibold text-foreground tabular-nums">{p.value}</span> leads
        <span className="ml-1">({p.payload.percent}%)</span>
      </div>
    </div>
  );
};

interface AcquisitionChartProps {
  leads: Lead[];
}

export default function AcquisitionChart({ leads }: AcquisitionChartProps) {
  const [view, setView] = useState<View>("overview");

  const buckets = useMemo(() => {
    let organico = 0, meta_ads = 0, google_ads = 0, outros = 0;
    leads.forEach((l) => {
      const tag = (l.tag_origem || "site") as LeadTagOrigem;
      if (tag === "meta_ads") meta_ads += 1;
      else if (tag === "google_ads") google_ads += 1;
      else if (tag === "organico") organico += 1;
      // 'site' e 'novo' contam como orgânico/direto na visão estratégica
      else organico += 1;
      if (tag !== "meta_ads" && tag !== "google_ads" && tag !== "organico" && tag !== "site" && tag !== "novo") {
        outros += 1;
      }
    });
    const pago = meta_ads + google_ads;
    const total = organico + pago + outros;
    return { organico, pago, meta_ads, google_ads, total };
  }, [leads]);

  const overviewData = useMemo(() => {
    const total = buckets.total || 1;
    return [
      {
        name: "Orgânico",
        value: buckets.organico,
        percent: Math.round((buckets.organico / total) * 100),
        fill: ACQ_COLORS.organico,
        key: "organico" as const,
      },
      {
        name: "Pago",
        value: buckets.pago,
        percent: Math.round((buckets.pago / total) * 100),
        fill: ACQ_COLORS.pago,
        key: "pago" as const,
      },
    ].filter((d) => d.value > 0);
  }, [buckets]);

  const paidData = useMemo(() => {
    const total = buckets.pago || 1;
    return [
      {
        name: "Meta Ads",
        value: buckets.meta_ads,
        percent: Math.round((buckets.meta_ads / total) * 100),
        fill: ACQ_COLORS.meta_ads,
      },
      {
        name: "Google Ads",
        value: buckets.google_ads,
        percent: Math.round((buckets.google_ads / total) * 100),
        fill: ACQ_COLORS.google_ads,
      },
    ].filter((d) => d.value > 0);
  }, [buckets]);

  const dominantPaid = useMemo(() => {
    if (buckets.pago === 0) return null;
    return buckets.meta_ads >= buckets.google_ads ? "Meta Ads" : "Google Ads";
  }, [buckets]);

  const paidPercent = buckets.total > 0 ? Math.round((buckets.pago / buckets.total) * 100) : 0;

  const isOverview = view === "overview";
  const data = isOverview ? overviewData : paidData;
  const centerLabel = isOverview ? "Total" : "Pago";
  const centerValue = isOverview ? buckets.total : buckets.pago;

  const handlePieClick = (entry: any) => {
    if (isOverview && entry?.key === "pago" && buckets.pago > 0) {
      setView("paid");
    }
  };

  if (buckets.total === 0) return null;

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold text-foreground text-sm">
            Aquisição de Leads
            {!isOverview && <span className="text-muted-foreground font-normal"> · Pago</span>}
          </h3>
        </div>
        <AnimatePresence>
          {!isOverview && (
            <motion.button
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              onClick={() => setView("overview")}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Voltar à visão geral
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="grid md:grid-cols-5 gap-6 items-center">
        {/* Donut */}
        <div className="md:col-span-3 relative h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                key={view}
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={105}
                paddingAngle={3}
                stroke="hsl(var(--card))"
                strokeWidth={3}
                onClick={handlePieClick}
                cursor={isOverview && buckets.pago > 0 ? "pointer" : "default"}
                isAnimationActive
                animationDuration={500}
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Pie>
              <Tooltip content={<PaidTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Centro do donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">{centerLabel}</span>
            <span className="font-display font-bold text-3xl text-foreground tabular-nums">{centerValue}</span>
            {isOverview && buckets.pago > 0 && (
              <span className="text-[10px] text-muted-foreground mt-1">clique em Pago para detalhar</span>
            )}
          </div>
        </div>

        {/* Legenda + KPIs */}
        <div className="md:col-span-2 space-y-3">
          {data.map((d) => (
            <button
              key={d.name}
              type="button"
              onClick={() => isOverview && d.key === "pago" && buckets.pago > 0 && setView("paid")}
              disabled={!(isOverview && d.key === "pago" && buckets.pago > 0)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-background/50 hover:bg-background transition-colors disabled:cursor-default disabled:hover:bg-background/50 text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                <span className="font-medium text-sm text-foreground truncate">{d.name}</span>
              </div>
              <div className="flex items-baseline gap-1.5 flex-shrink-0">
                <span className="font-display font-bold text-foreground tabular-nums">{d.value}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{d.percent}%</span>
              </div>
            </button>
          ))}

          {isOverview && (
            <div className="pt-2 mt-2 border-t border-border grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-background/50">
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  Pago
                </div>
                <div className="font-display font-bold text-foreground tabular-nums text-lg">
                  {paidPercent}<span className="text-xs text-muted-foreground">%</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-background/50">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Top canal pago</div>
                <div className="font-display font-bold text-foreground text-sm truncate">
                  {dominantPaid || "—"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
