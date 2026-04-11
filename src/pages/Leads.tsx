import { useState, useEffect, useMemo } from "react";
import { getLeads, deleteLead, type Lead } from "@/lib/leads";
import { Trash2, RefreshCw, Users, Clock, MapPin, Phone, MessageSquare, CalendarIcon, BarChart3 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";

const CHART_COLORS = [
  "hsl(210, 80%, 50%)",
  "hsl(210, 60%, 65%)",
  "hsl(210, 40%, 75%)",
  "hsl(210, 90%, 40%)",
  "hsl(210, 70%, 55%)",
  "hsl(200, 60%, 50%)",
  "hsl(220, 60%, 50%)",
  "hsl(190, 60%, 50%)",
];

const PIE_COLORS = ["hsl(142, 60%, 45%)", "hsl(0, 60%, 50%)", "hsl(210, 10%, 60%)"];

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const refresh = () => setLeads(getLeads());

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = (id: string) => {
    deleteLead(id);
    refresh();
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const d = new Date(lead.createdAt);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (d < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    });
  }, [leads, startDate, endDate]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  // Chart data
  const cityData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredLeads.forEach((l) => {
      const city = l.city || "Não informado";
      map[city] = (map[city] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredLeads]);

  const particularData = useMemo(() => {
    let sim = 0, nao = 0, empty = 0;
    filteredLeads.forEach((l) => {
      if (l.isParticular === "Sim") sim++;
      else if (l.isParticular === "Não") nao++;
      else empty++;
    });
    const data = [];
    if (sim) data.push({ name: "Sim", value: sim });
    if (nao) data.push({ name: "Não", value: nao });
    if (empty) data.push({ name: "Não respondeu", value: empty });
    return data;
  }, [filteredLeads]);

  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredLeads.forEach((l) => {
      const day = new Date(l.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map).map(([date, leads]) => ({ date, leads }));
  }, [filteredLeads]);

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6" />
            <div>
              <h1 className="font-display font-bold text-xl">CRM de Leads</h1>
              <p className="text-sm opacity-80">Lopes Saúde e Odontologia</p>
            </div>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-foreground/15 hover:bg-primary-foreground/25 transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Total de Leads", value: filteredLeads.length },
            { label: "Particular (Sim)", value: filteredLeads.filter((l) => l.isParticular === "Sim").length },
            { label: "Particular (Não)", value: filteredLeads.filter((l) => l.isParticular === "Não").length },
            { label: "Não respondeu", value: filteredLeads.filter((l) => !l.isParticular).length },
            { label: "Hoje", value: filteredLeads.filter((l) => new Date(l.createdAt).toDateString() === new Date().toDateString()).length },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-4">
              <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Date filter */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-foreground">Filtrar por data:</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yyyy") : "Data início"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} locale={ptBR} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd/MM/yyyy") : "Data fim"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} locale={ptBR} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
          {(startDate || endDate) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              Limpar filtros
            </Button>
          )}
        </div>

        {/* Charts */}
        {filteredLeads.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Leads por dia */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h3 className="font-display font-bold text-foreground text-sm">Leads por dia</h3>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 10%, 90%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="leads" stroke="hsl(210, 80%, 50%)" strokeWidth={2} dot={{ r: 4 }} name="Leads" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Leads por cidade */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="font-display font-bold text-foreground text-sm">Leads por cidade</h3>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 10%, 90%)" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" name="Leads" radius={[0, 4, 4, 0]}>
                      {cityData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Particular vs Não */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="font-display font-bold text-foreground text-sm">Particular</h3>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={particularData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                      {particularData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Leads list */}
        {filteredLeads.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Nenhum lead encontrado</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {startDate || endDate
                ? "Nenhum lead no período selecionado. Tente alterar as datas."
                : "Os leads aparecerão aqui quando alguém preencher o formulário no site."}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-3">{filteredLeads.length} lead(s) encontrado(s)</p>
            <ScrollArea className="h-[500px] rounded-xl border border-border">
              <div className="space-y-4 p-4">
                {filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-display font-bold text-foreground text-lg truncate">
                            {lead.name || "Sem nome"}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              lead.isParticular === "Sim"
                                ? "bg-green-100 text-green-700"
                                : lead.isParticular === "Não"
                                ? "bg-red-100 text-red-700"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {lead.isParticular ? `Particular: ${lead.isParticular}` : "Não respondeu"}
                          </span>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{lead.whatsapp || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{lead.city || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatDate(lead.createdAt)}</span>
                          </div>
                        </div>

                        {lead.message && (
                          <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                            <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <p className="line-clamp-2">{lead.message}</p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Excluir lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leads;
