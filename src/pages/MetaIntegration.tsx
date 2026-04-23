import { useMemo, useRef, useState } from "react";
import UserMenu from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft, Upload, RefreshCw, Activity, DollarSign, Eye, MousePointerClick,
  Target, TrendingUp, Users, Percent, Calculator, ArrowUpDown, Search, Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, PieChart, Pie, Cell,
} from "recharts";
import {
  DEFAULT_DATASET, parseMetaAdsFile, formatBRL, formatInt, formatPct,
  type CampaignRow, type MetaAdsDataset,
} from "@/lib/metaAdsSheet";

type SortKey = keyof CampaignRow;

const PIE_COLORS = [
  "hsl(213, 80%, 50%)",
  "hsl(160, 65%, 42%)",
  "hsl(35, 90%, 55%)",
  "hsl(330, 70%, 55%)",
  "hsl(270, 60%, 58%)",
  "hsl(190, 70%, 45%)",
];

interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  hint?: string;
}
const KpiCard = ({ label, value, icon: Icon, hint }: KpiCardProps) => (
  <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2 shadow-sm">
    <div className="flex items-center justify-between text-muted-foreground">
      <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      <Icon className="w-4 h-4" />
    </div>
    <p className="text-2xl font-display font-bold text-foreground leading-tight">{value}</p>
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const MetaIntegration = () => {
  const [dataset, setDataset] = useState<MetaAdsDataset>(DEFAULT_DATASET);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const ds = await parseMetaAdsFile(file);
      setDataset(ds);
      toast.success(`Planilha "${file.name}" carregada · ${ds.campaigns.length} campanhas`);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Falha ao ler a planilha";
      toast.error(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const statuses = useMemo(() => {
    const s = new Set<string>();
    dataset.campaigns.forEach((c) => c.status && s.add(c.status));
    return Array.from(s);
  }, [dataset]);

  const filtered = useMemo(() => {
    return dataset.campaigns.filter((c) => {
      if (campaignFilter !== "all" && c.campaign !== campaignFilter) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (search.trim() && !c.campaign.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [dataset, campaignFilter, statusFilter, search]);

  const filteredSummary = useMemo(() => {
    const totalSpend = filtered.reduce((s, c) => s + c.spend, 0);
    const totalImpressions = filtered.reduce((s, c) => s + c.impressions, 0);
    const totalReach = filtered.reduce((s, c) => s + c.reach, 0);
    const totalClicks = filtered.reduce((s, c) => s + c.clicks, 0);
    const totalConversions = filtered.reduce((s, c) => s + c.conversions, 0);
    return {
      totalSpend, totalImpressions, totalReach, totalClicks, totalConversions,
      cpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
      ctr: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
      conversionRate: totalClicks > 0 ? totalConversions / totalClicks : 0,
      costPerConversion: totalConversions > 0 ? totalSpend / totalConversions : 0,
      cpm: totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0,
    };
  }, [filtered]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      const sa = String(va ?? "");
      const sb = String(vb ?? "");
      return sortDir === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const barData = filtered.map((c) => ({
    name: c.campaign.replace(/^CBO\s*-\s*/, ""),
    custo: Number(c.spend.toFixed(2)),
    cliques: c.clicks,
    conversoes: c.conversions,
    impressoes: c.impressions,
  }));

  const pieSpend = filtered.map((c) => ({ name: c.campaign, value: c.spend }));
  const pieConv = filtered
    .filter((c) => c.conversions > 0)
    .map((c) => ({ name: c.campaign, value: c.conversions }));

  const reset = () => {
    setDataset(DEFAULT_DATASET);
    setSearch(""); setCampaignFilter("all"); setStatusFilter("all");
    toast.info("Dados restaurados para a planilha modelo");
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6" />
            <div>
              <h1 className="font-display font-bold text-xl">Meta Ads</h1>
              <p className="text-sm opacity-80">
                Dashboard de performance · {dataset.summary.periodStart && dataset.summary.periodEnd
                  ? `${dataset.summary.periodStart} a ${dataset.summary.periodEnd}`
                  : "período não informado"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/leads">
              <Button variant="secondary" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Voltar ao CRM
              </Button>
            </Link>
            <Button onClick={reset} variant="secondary" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" /> Restaurar
            </Button>
            <UserMenu />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Upload */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary rounded-lg p-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-foreground">Atualizar com nova planilha</h2>
              <p className="text-sm text-muted-foreground">
                Envie um arquivo .xlsx, .xls ou .csv exportado do Meta Ads. Os KPIs e gráficos
                serão recalculados automaticamente · Origem atual: <span className="font-medium">{dataset.sourceSheet}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2">
              <Upload className="w-4 h-4" />
              {uploading ? "Processando..." : "Enviar planilha"}
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Investimento" value={formatBRL(filteredSummary.totalSpend)} icon={DollarSign} />
          <KpiCard label="Impressões" value={formatInt(filteredSummary.totalImpressions)} icon={Eye} />
          <KpiCard label="Cliques" value={formatInt(filteredSummary.totalClicks)} icon={MousePointerClick} hint="Contatos por mensagem" />
          <KpiCard label="Conversões" value={formatInt(filteredSummary.totalConversions)} icon={Target} hint="Novos contatos" />
          <KpiCard label="CPC médio" value={formatBRL(filteredSummary.cpc)} icon={Calculator} />
          <KpiCard label="CPM" value={formatBRL(filteredSummary.cpm)} icon={Calculator} />
          <KpiCard label="CTR" value={formatPct(filteredSummary.ctr, 3)} icon={Percent} />
          <KpiCard label="Custo / conversão" value={filteredSummary.totalConversions > 0 ? formatBRL(filteredSummary.costPerConversion) : "—"} icon={TrendingUp} hint={`Taxa: ${formatPct(filteredSummary.conversionRate, 1)}`} />
        </div>

        {/* Filtros */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar campanha..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={campaignFilter} onValueChange={setCampaignFilter}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="Campanha" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as campanhas</SelectItem>
              {dataset.campaigns.map((c) => (
                <SelectItem key={c.campaign} value={c.campaign}>{c.campaign}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {statuses.length > 0 && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Badge variant="outline" className="gap-1">
            <Users className="w-3 h-3" /> {filtered.length} campanha{filtered.length === 1 ? "" : "s"}
          </Badge>
        </div>

        {/* Gráficos principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-display font-semibold text-foreground mb-1">Custo, cliques e conversões por campanha</h3>
            <p className="text-xs text-muted-foreground mb-4">Comparativo das principais métricas</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number, name: string) => name === "custo" ? formatBRL(v) : formatInt(v)}
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="custo" name="Custo (R$)" fill="hsl(213, 80%, 50%)" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="right" dataKey="cliques" name="Cliques" fill="hsl(35, 90%, 55%)" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="right" dataKey="conversoes" name="Conversões" fill="hsl(160, 65%, 42%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-display font-semibold text-foreground mb-1">Impressões × Cliques × Conversões</h3>
            <p className="text-xs text-muted-foreground mb-4">Funil de mídia em escala logarítmica visual</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number) => formatInt(v)}
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                />
                <Legend />
                <Bar dataKey="impressoes" name="Impressões" fill="hsl(213, 80%, 50%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="cliques" name="Cliques" fill="hsl(35, 90%, 55%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="conversoes" name="Conversões" fill="hsl(160, 65%, 42%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">Participação no investimento</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieSpend} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                  {pieSpend.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">Participação nas conversões</h3>
            {pieConv.length === 0 ? (
              <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
                Nenhuma conversão registrada nas campanhas filtradas.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieConv} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                    {pieConv.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatInt(v)} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Tabela analítica */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-foreground">Detalhamento por campanha</h3>
              <p className="text-xs text-muted-foreground">Clique no cabeçalho para ordenar</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {([
                    ["campaign", "Campanha"],
                    ["status", "Status"],
                    ["impressions", "Impressões"],
                    ["clicks", "Cliques"],
                    ["spend", "Custo"],
                    ["cpm", "CPM"],
                    ["conversions", "Conversões"],
                    ["costPerConversion", "Custo/conv."],
                  ] as [SortKey, string][]).map(([key, label]) => (
                    <TableHead key={key}>
                      <button onClick={() => toggleSort(key)} className="flex items-center gap-1 hover:text-foreground">
                        {label} <ArrowUpDown className="w-3 h-3 opacity-50" />
                      </button>
                    </TableHead>
                  ))}
                  <TableHead>CPC</TableHead>
                  <TableHead>CTR</TableHead>
                  <TableHead>Taxa conv.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                      Nenhuma campanha encontrada para os filtros atuais.
                    </TableCell>
                  </TableRow>
                )}
                {sorted.map((c) => {
                  const cpc = c.clicks > 0 ? c.spend / c.clicks : 0;
                  const ctr = c.impressions > 0 ? c.clicks / c.impressions : 0;
                  const taxa = c.clicks > 0 ? c.conversions / c.clicks : 0;
                  return (
                    <TableRow key={c.campaign}>
                      <TableCell className="font-medium">{c.campaign}</TableCell>
                      <TableCell>
                        {c.status ? <Badge variant="outline" className="capitalize">{c.status}</Badge> : "—"}
                      </TableCell>
                      <TableCell>{formatInt(c.impressions)}</TableCell>
                      <TableCell>{formatInt(c.clicks)}</TableCell>
                      <TableCell>{formatBRL(c.spend)}</TableCell>
                      <TableCell>{c.cpm != null ? formatBRL(c.cpm) : "—"}</TableCell>
                      <TableCell>{formatInt(c.conversions)}</TableCell>
                      <TableCell>{c.costPerConversion != null ? formatBRL(c.costPerConversion) : "—"}</TableCell>
                      <TableCell>{c.clicks > 0 ? formatBRL(cpc) : "—"}</TableCell>
                      <TableCell>{formatPct(ctr, 3)}</TableCell>
                      <TableCell>{c.clicks > 0 ? formatPct(taxa, 1) : "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaIntegration;
