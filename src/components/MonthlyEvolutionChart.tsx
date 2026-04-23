import { BarChart3 } from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

export interface MonthlyDatum {
  label: string;
  total: number;
  convertidos: number;
}

const COLOR_TOTAL = "hsl(213, 80%, 45%)";
const COLOR_CONV = "hsl(142, 60%, 45%)";

const ExecTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const total = payload.find((p: any) => p.dataKey === "total")?.value ?? 0;
  const convertidos = payload.find((p: any) => p.dataKey === "convertidos")?.value ?? 0;
  const rate = total > 0 ? Math.round((convertidos / total) * 100) : 0;
  return (
    <div className="rounded-xl border border-border bg-card/95 backdrop-blur shadow-lg px-3.5 py-2.5 text-xs min-w-[180px]">
      <div className="font-display font-bold text-foreground text-sm mb-2 capitalize">{label}</div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLOR_TOTAL }} />
            Total:
          </span>
          <span className="font-semibold text-foreground tabular-nums">{total}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLOR_CONV }} />
            Convertidos:
          </span>
          <span className="font-semibold text-foreground tabular-nums">{convertidos}</span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-border flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Taxa de conversão:</span>
        <span className="font-display font-bold tabular-nums" style={{ color: COLOR_CONV }}>
          {rate}%
        </span>
      </div>
    </div>
  );
};

interface Props {
  data: MonthlyDatum[];
}

export default function MonthlyEvolutionChart({ data }: Props) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-4.5 h-4.5 text-primary" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-base leading-tight">
              Evolução mensal de leads
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Acompanhe o volume total de leads e os convertidos por mês.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLOR_TOTAL }} />
            Total
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLOR_CONV }} />
            Convertidos
          </span>
        </div>
      </div>

      {/* Eixo labels */}
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider mb-1 px-1">
        <span style={{ color: COLOR_TOTAL }} className="font-semibold">Leads (Total)</span>
        <span style={{ color: COLOR_CONV }} className="font-semibold">Leads (Convertidos)</span>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 24, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="hsl(214, 20%, 92%)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "hsl(215, 10%, 46%)" }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              yAxisId="left"
              allowDecimals={false}
              tick={{ fontSize: 10, fill: COLOR_TOTAL }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              allowDecimals={false}
              tick={{ fontSize: 10, fill: COLOR_CONV }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              content={<ExecTooltip />}
              cursor={{ fill: "hsl(213, 80%, 45%)", fillOpacity: 0.06 }}
            />
            <Bar
              yAxisId="left"
              dataKey="total"
              name="Total"
              fill={COLOR_TOTAL}
              radius={[8, 8, 0, 0]}
              maxBarSize={48}
              isAnimationActive
              animationDuration={600}
            >
              <LabelList
                dataKey="total"
                position="top"
                fill={COLOR_TOTAL}
                fontSize={11}
                fontWeight={700}
                formatter={(v: number) => (v > 0 ? v : "")}
              />
            </Bar>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="convertidos"
              name="Convertidos"
              stroke={COLOR_CONV}
              strokeWidth={2.5}
              dot={{ r: 4, fill: "hsl(0 0% 100%)", stroke: COLOR_CONV, strokeWidth: 2 }}
              activeDot={{ r: 6, fill: COLOR_CONV, stroke: "hsl(0 0% 100%)", strokeWidth: 2 }}
              isAnimationActive
              animationDuration={700}
            >
              <LabelList
                dataKey="convertidos"
                position="top"
                fill={COLOR_CONV}
                fontSize={11}
                fontWeight={700}
                formatter={(v: number) => (v > 0 ? v : "")}
              />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
        <span className="w-4 h-4 rounded-full bg-background border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0">
          i
        </span>
        Taxa de conversão = (Convertidos / Total) × 100
      </div>
    </div>
  );
}
