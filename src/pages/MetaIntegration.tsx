import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import UserMenu from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface MetaLog {
  id: string;
  lead_id: string | null;
  event_name: string;
  request_payload: unknown;
  response_payload: unknown;
  success: boolean;
  error_message: string | null;
  test_event_code: string | null;
  http_status: number | null;
  created_at: string;
}

interface LeadSummary {
  id: string;
  name: string | null;
  whatsapp: string;
  status: string;
  sincronizado_meta: boolean | null;
  ultimo_status_enviado_meta: string | null;
  ultimo_envio_meta_em: string | null;
  ultimo_erro_meta: string | null;
}

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const MetaIntegration = () => {
  const [logs, setLogs] = useState<MetaLog[]>([]);
  const [leads, setLeads] = useState<LeadSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MetaLog | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const [{ data: logsData, error: logsErr }, { data: leadsData, error: leadsErr }] =
        await Promise.all([
          supabase
            .from("meta_integration_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(100),
          supabase
            .from("leads")
            .select(
              "id,name,whatsapp,status,sincronizado_meta,ultimo_status_enviado_meta,ultimo_envio_meta_em,ultimo_erro_meta"
            )
            .order("ultimo_envio_meta_em", { ascending: false, nullsFirst: false })
            .limit(50),
        ]);
      if (logsErr) throw logsErr;
      if (leadsErr) throw leadsErr;
      setLogs((logsData || []) as MetaLog[]);
      setLeads((leadsData || []) as LeadSummary[]);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados da integração");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const successCount = logs.filter((l) => l.success).length;
  const errorCount = logs.length - successCount;
  const testMode = logs.find((l) => l.test_event_code)?.test_event_code;

  return (
    <div className="min-h-screen bg-background font-body">
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6" />
            <div>
              <h1 className="font-display font-bold text-xl">Integração Meta</h1>
              <p className="text-sm opacity-80">Conversions API · Lopes Saúde</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/leads">
              <Button variant="secondary" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Voltar ao CRM
              </Button>
            </Link>
            <Button onClick={refresh} variant="secondary" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" /> Atualizar
            </Button>
            <UserMenu />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-2xl font-display font-bold text-foreground">{logs.length}</p>
            <p className="text-sm text-muted-foreground">Eventos enviados (últimos 100)</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-2xl font-display font-bold text-green-600">{successCount}</p>
            <p className="text-sm text-muted-foreground">Sucessos</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-2xl font-display font-bold text-red-600">{errorCount}</p>
            <p className="text-sm text-muted-foreground">Erros</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm font-display font-bold text-foreground">
              {testMode ? `Teste · ${testMode}` : "Produção"}
            </p>
            <p className="text-sm text-muted-foreground">Modo</p>
          </div>
        </div>

        {/* Leads sincronizados */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-display font-bold text-foreground">
              Últimos leads sincronizados com a Meta
            </h2>
          </div>
          <ScrollArea className="max-h-[320px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Status atual</TableHead>
                  <TableHead>Último envio</TableHead>
                  <TableHead>Status enviado</TableHead>
                  <TableHead>Resultado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                      {loading ? "Carregando..." : "Nenhum lead sincronizado ainda."}
                    </TableCell>
                  </TableRow>
                )}
                {leads.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <div className="font-medium">{l.name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{l.whatsapp}</div>
                    </TableCell>
                    <TableCell>{l.status}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(l.ultimo_envio_meta_em)}
                    </TableCell>
                    <TableCell>{l.ultimo_status_enviado_meta || "—"}</TableCell>
                    <TableCell>
                      {l.ultimo_envio_meta_em == null ? (
                        <Badge variant="outline">Não enviado</Badge>
                      ) : l.sincronizado_meta ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
                          <CheckCircle2 className="w-3 h-3" /> OK
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1">
                          <XCircle className="w-3 h-3" /> Erro
                        </Badge>
                      )}
                      {l.ultimo_erro_meta && (
                        <div className="text-xs text-red-600 mt-1 max-w-xs truncate">
                          {l.ultimo_erro_meta}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        {/* Logs */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-display font-bold text-foreground">Logs de envio</h2>
          </div>
          <ScrollArea className="max-h-[480px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>HTTP</TableHead>
                  <TableHead>Sucesso</TableHead>
                  <TableHead>Erro</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                      {loading ? "Carregando..." : "Nenhum log ainda."}
                    </TableCell>
                  </TableRow>
                )}
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">{formatDate(log.created_at)}</TableCell>
                    <TableCell className="font-medium">{log.event_name}</TableCell>
                    <TableCell>{log.http_status ?? "—"}</TableCell>
                    <TableCell>
                      {log.success ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">OK</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Erro</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-red-600 max-w-xs truncate">
                      {log.error_message || "—"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelected(log)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>

      {/* Detalhe do log */}
      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              Detalhes do envio · {selected?.event_name}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">Data</p>
                  <p className="font-medium">{formatDate(selected.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">HTTP / Sucesso</p>
                  <p className="font-medium">
                    {selected.http_status ?? "—"} · {selected.success ? "OK" : "Erro"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Test event code</p>
                  <p className="font-medium">{selected.test_event_code || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Lead ID</p>
                  <p className="font-mono text-xs break-all">{selected.lead_id || "—"}</p>
                </div>
              </div>
              {selected.error_message && (
                <div>
                  <p className="text-muted-foreground mb-1">Erro</p>
                  <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                    {selected.error_message}
                  </pre>
                </div>
              )}
              <div>
                <p className="text-muted-foreground mb-1">Payload enviado</p>
                <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(selected.request_payload, null, 2)}
                </pre>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Resposta da Meta</p>
                <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(selected.response_payload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MetaIntegration;
