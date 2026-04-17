import { useState, useEffect, useMemo } from "react";
import {
  getLeads,
  deleteLead,
  updateLead,
  type Lead,
  type LeadStatus,
  type LeadOrigem,
  STATUS_LABELS,
  ORIGEM_LABELS,
} from "@/lib/leads";
import {
  Trash2, RefreshCw, Users, Clock, MapPin, Phone, MessageSquare,
  CalendarIcon, BarChart3, Plus, Pencil, Search, MessageCircle, LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import LeadFormDialog from "@/components/LeadFormDialog";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, LabelList,
} from "recharts";

const ORIGEM_COLORS: Record<LeadOrigem, string> = {
  site: "hsl(213, 80%, 45%)",
  whatsapp: "hsl(142, 60%, 45%)",
  indicacao: "hsl(270, 60%, 55%)",
  redes_sociais: "hsl(330, 70%, 55%)",
  manual: "hsl(210, 15%, 50%)",
  outro: "hsl(35, 85%, 55%)",
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  novo: "bg-blue-100 text-blue-700",
  em_contato: "bg-yellow-100 text-yellow-700",
  agendado: "bg-purple-100 text-purple-700",
  convertido: "bg-green-100 text-green-700",
  perdido: "bg-red-100 text-red-700",
};

const STATUS_PIE_COLORS: Record<LeadStatus, string> = {
  novo: "hsl(210, 80%, 50%)",
  em_contato: "hsl(45, 90%, 55%)",
  agendado: "hsl(270, 60%, 55%)",
  convertido: "hsl(142, 60%, 45%)",
  perdido: "hsl(0, 60%, 50%)",
};

// Tooltip premium reutilizável
const PremiumTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card/95 backdrop-blur shadow-lg px-3 py-2 text-xs">
      {label && <p className="font-display font-semibold text-foreground mb-1">{label}</p>}
      <div className="space-y-1">
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
            <span className="text-muted-foreground">{p.name}:</span>
            <span className="font-semibold text-foreground tabular-nums">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Leads = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [origemFilter, setOrigemFilter] = useState<string>("todos");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este lead?")) return;
    try {
      await deleteLead(id);
      toast.success("Lead excluído");
      refresh();
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    try {
      await updateLead(id, { status });
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      toast.success("Status atualizado");
    } catch {
      toast.error("Erro ao atualizar status");
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const d = new Date(lead.created_at);
      const leadDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (startDate) {
        const s = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        if (leadDate < s) return false;
      }
      if (endDate) {
        const e = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        if (leadDate > e) return false;
      }
      if (statusFilter !== "todos" && lead.status !== statusFilter) return false;
      if (origemFilter !== "todos" && lead.origem !== origemFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${lead.name || ""} ${lead.whatsapp} ${lead.city} ${lead.message || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [leads, startDate, endDate, statusFilter, origemFilter, search]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

  // Charts
  const cityData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredLeads.forEach((l) => {
      const c = l.city || "Não informado";
      map[c] = (map[c] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value).slice(0, 8);
  }, [filteredLeads]);

  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredLeads.forEach((l) => {
      map[l.status] = (map[l.status] || 0) + 1;
    });
    return Object.entries(map).map(([k, value]) => ({
      name: STATUS_LABELS[k as LeadStatus], value, key: k as LeadStatus,
    }));
  }, [filteredLeads]);

  const monthlyData = useMemo(() => {
    const map: Record<string, { key: string; label: string; total: number; convertidos: number }> = {};
    filteredLeads.forEach((l) => {
      const d = new Date(l.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(".", "");
      if (!map[key]) map[key] = { key, label, total: 0, convertidos: 0 };
      map[key].total += 1;
      if (l.status === "convertido") map[key].convertidos += 1;
    });
    return Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
  }, [filteredLeads]);

  const origemData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredLeads.forEach((l) => {
      map[l.origem] = (map[l.origem] || 0) + 1;
    });
    const total = filteredLeads.length || 1;
    return Object.entries(map)
      .map(([k, value]) => ({
        key: k as LeadOrigem,
        name: ORIGEM_LABELS[k as LeadOrigem] || k,
        value,
        percent: Math.round((value / total) * 100),
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredLeads]);

  const conversionRate = useMemo(() => {
    if (filteredLeads.length === 0) return 0;
    const c = filteredLeads.filter((l) => l.status === "convertido").length;
    return Math.round((c / filteredLeads.length) * 100);
  }, [filteredLeads]);

  const clearFilters = () => {
    setStartDate(undefined); setEndDate(undefined);
    setStatusFilter("todos"); setOrigemFilter("todos"); setSearch("");
  };

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (lead: Lead) => { setEditing(lead); setDialogOpen(true); };

  const todayCount = filteredLeads.filter(
    (l) => new Date(l.created_at).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="min-h-screen bg-background font-body">
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6" />
            <div>
              <h1 className="font-display font-bold text-xl">CRM de Leads</h1>
              <p className="text-sm opacity-80">Lopes Saúde e Odontologia</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={openNew} variant="secondary" size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Novo Lead
            </Button>
            <Button onClick={refresh} variant="secondary" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" /> Atualizar
            </Button>
            <Button onClick={handleSignOut} variant="secondary" size="sm" className="gap-2">
              <LogOut className="w-4 h-4" /> Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Total de leads", value: filteredLeads.length },
            { label: "Novos", value: filteredLeads.filter((l) => l.status === "novo").length },
            { label: "Convertidos", value: filteredLeads.filter((l) => l.status === "convertido").length },
            { label: "Perdidos", value: filteredLeads.filter((l) => l.status === "perdido").length },
            { label: "Taxa de conversão", value: `${conversionRate}%` },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-4">
              <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar nome, WhatsApp, cidade..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos status</SelectItem>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={origemFilter} onValueChange={setOrigemFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Origem" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas origens</SelectItem>
                {Object.entries(ORIGEM_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[170px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
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
                <Button variant="outline" className={cn("w-[170px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : "Data fim"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} locale={ptBR} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
            {(startDate || endDate || statusFilter !== "todos" || origemFilter !== "todos" || search) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                Limpar filtros
              </Button>
            )}
            <span className="text-sm text-muted-foreground ml-auto">
              Taxa de conversão: <span className="font-bold text-foreground">{conversionRate}%</span>
            </span>
          </div>
        </div>

        {/* Charts */}
        {filteredLeads.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-6">
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

            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="font-display font-bold text-foreground text-sm">Por status</h3>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                      {statusData.map((d, i) => (
                        <Cell key={i} fill={STATUS_PIE_COLORS[d.key]} />
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

        {/* Lista */}
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Carregando...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Nenhum lead encontrado</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Ajuste os filtros ou cadastre um lead manualmente.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-3">{filteredLeads.length} lead(s)</p>
            <ScrollArea className="h-[600px] rounded-xl border border-border">
              <div className="space-y-3 p-4">
                {filteredLeads.map((lead) => (
                  <div key={lead.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h3 className="font-display font-bold text-foreground text-lg truncate">
                            {lead.name || "Sem nome"}
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status]}`}>
                            {STATUS_LABELS[lead.status]}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            {ORIGEM_LABELS[lead.origem]}
                          </span>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" /><span>{lead.whatsapp || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" /><span>{lead.city || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" /><span>{formatDate(lead.created_at)}</span>
                          </div>
                        </div>
                        {lead.message && (
                          <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                            <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <p className="line-clamp-2">{lead.message}</p>
                          </div>
                        )}
                        {lead.notes && (
                          <div className="mt-2 text-xs text-muted-foreground/80 italic border-l-2 border-primary/30 pl-2">
                            {lead.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Select value={lead.status} onValueChange={(v) => handleStatusChange(lead.id, v as LeadStatus)}>
                          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_LABELS).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-1">
                          {lead.whatsapp && (
                            <a
                              href={`https://api.whatsapp.com/send?phone=${lead.whatsapp.replace(/\D/g, "")}`}
                              target="_blank" rel="noopener noreferrer"
                              className="p-2 rounded-lg text-muted-foreground hover:text-green-600 hover:bg-green-50 transition-colors"
                              title="Abrir WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => openEdit(lead)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      <LeadFormDialog open={dialogOpen} onOpenChange={setDialogOpen} lead={editing} onSaved={refresh} />
    </div>
  );
};

export default Leads;
