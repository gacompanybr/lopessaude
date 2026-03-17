import { useState, useEffect } from "react";
import { getLeads, deleteLead, type Lead } from "@/lib/leads";
import { Trash2, RefreshCw, Users, Clock, MapPin, Phone, MessageSquare } from "lucide-react";

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);

  const refresh = () => setLeads(getLeads());

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = (id: string) => {
    deleteLead(id);
    refresh();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total de Leads", value: leads.length },
            { label: "Particular (Sim)", value: leads.filter((l) => l.isParticular === "Sim").length },
            { label: "Particular (Não)", value: leads.filter((l) => l.isParticular === "Não").length },
            { label: "Hoje", value: leads.filter((l) => new Date(l.createdAt).toDateString() === new Date().toDateString()).length },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-4">
              <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {leads.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Nenhum lead registrado ainda</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Os leads aparecerão aqui quando alguém preencher o formulário no site.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
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
        )}
      </div>
    </div>
  );
};

export default Leads;
