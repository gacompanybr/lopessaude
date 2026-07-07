import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileSpreadsheet, X, Play, Pause, Square, Send, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { parseDispatchFile, renderTemplate, TEMPLATE_VARIABLES, type DispatchContact } from "@/lib/dispatchTemplate";
import { getEvolutionConfig, sendTextMessage } from "@/lib/evolution";

interface Props {
  connected: boolean;
}

type Status = "pendente" | "enviado" | "erro";
interface QueueItem {
  contact: DispatchContact;
  status: Status;
  message?: string;
  error?: string;
  sentAt?: string;
}

const DEFAULT_TEMPLATE = `Olá {primeiro_nome}! Aqui é da Lopes Saúde e Odontologia.

Identificamos uma pendência no seu cadastro:
Valor: {valor}
Parcelas: {parcelas}
Situação: {situacao}

Podemos regularizar hoje? Qualquer dúvida é só responder por aqui. 🙏`;

const DispatchCampaign = ({ connected }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [rate, setRate] = useState(6); // por hora
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const pausedRef = useRef(false);

  const intervalMs = useMemo(() => Math.max(1000, Math.round((3600 / rate) * 1000)), [rate]);

  const stats = useMemo(() => ({
    total: queue.length,
    enviados: queue.filter((q) => q.status === "enviado").length,
    erros: queue.filter((q) => q.status === "erro").length,
    pendentes: queue.filter((q) => q.status === "pendente").length,
  }), [queue]);

  const handlePick = async (f: File | undefined | null) => {
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext || "")) {
      toast.error("Formato inválido. Use .xlsx ou .csv");
      return;
    }
    setFile(f);
    try {
      const contacts = await parseDispatchFile(f);
      if (contacts.length === 0) {
        toast.warning("Nenhum contato válido encontrado (é preciso ter coluna de WhatsApp/telefone).");
      }
      setQueue(contacts.map((c) => ({ contact: c, status: "pendente" as Status })));
      toast.success(`${contacts.length} contato(s) prontos para disparo`);
    } catch (e: any) {
      toast.error(`Erro ao ler planilha: ${e.message}`);
    }
  };

  const clearFile = () => {
    setFile(null);
    setQueue([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const previewMessage = useMemo(() => {
    const c = queue[0]?.contact;
    if (!c) return "";
    return renderTemplate(template, c);
  }, [template, queue]);

  const sleep = (ms: number) => new Promise<void>((res) => {
    const start = Date.now();
    const tick = () => {
      if (!runningRef.current) return res();
      if (Date.now() - start >= ms) return res();
      setTimeout(tick, 500);
    };
    tick();
  });

  const start = async () => {
    if (!connected) { toast.error("Conecte o WhatsApp primeiro"); return; }
    const cfg = getEvolutionConfig();
    if (!cfg) { toast.error("Configuração da Evolution API não encontrada"); return; }
    if (queue.length === 0) { toast.error("Faça upload da planilha primeiro"); return; }
    if (!template.trim()) { toast.error("Escreva o template da mensagem"); return; }

    setRunning(true);
    runningRef.current = true;
    pausedRef.current = false;

    for (let i = 0; i < queue.length; i++) {
      if (!runningRef.current) break;

      // pausa: aguarda até despausar/stop
      while (pausedRef.current && runningRef.current) {
        await new Promise((r) => setTimeout(r, 400));
      }
      if (!runningRef.current) break;

      const item = queue[i];
      if (item.status === "enviado") continue;

      const msg = renderTemplate(template, item.contact);
      try {
        await sendTextMessage(cfg, item.contact.whatsapp, msg);
        setQueue((prev) => prev.map((q, idx) => idx === i ? {
          ...q, status: "enviado", message: msg, sentAt: new Date().toISOString()
        } : q));
      } catch (e: any) {
        setQueue((prev) => prev.map((q, idx) => idx === i ? {
          ...q, status: "erro", message: msg, error: e.message
        } : q));
      }

      // aguarda intervalo antes do próximo (exceto no último)
      if (i < queue.length - 1) await sleep(intervalMs);
    }

    setRunning(false);
    runningRef.current = false;
    toast.success("Disparo finalizado");
  };

  const pauseToggle = () => {
    pausedRef.current = !pausedRef.current;
    toast.info(pausedRef.current ? "Pausado" : "Retomando...");
  };

  const stop = () => {
    runningRef.current = false;
    pausedRef.current = false;
    setRunning(false);
    toast.info("Disparo interrompido");
  };

  return (
    <div className="space-y-5">
      {/* Upload */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-foreground">1. Planilha de contatos</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Colunas aceitas (qualquer variação): <strong>nome/descrição</strong>, <strong>whatsapp/telefone/celular</strong>,
          <strong> valor</strong>, <strong>parcelas</strong>, <strong>situação</strong>, <strong>vencimento</strong>, <strong>documento/cpf</strong>.
          A coluna de telefone é obrigatória.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
            onChange={(e) => handlePick(e.target.files?.[0])} />
          <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={running} className="gap-2">
            <Upload className="w-4 h-4" /> Selecionar planilha
          </Button>
          {file && (
            <div className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
              <FileSpreadsheet className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium truncate max-w-[240px]">{file.name}</span>
              <span className="text-xs text-muted-foreground">· {queue.length} contatos</span>
              <button onClick={clearFile} disabled={running} className="text-muted-foreground hover:text-destructive" aria-label="Remover">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Template */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <Send className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-foreground">2. Template da mensagem</h3>
        </div>
        <Textarea
          value={template} onChange={(e) => setTemplate(e.target.value)} rows={7}
          className="font-mono text-sm" disabled={running}
        />
        <div className="mt-3 grid gap-1 sm:grid-cols-2 text-xs">
          <p className="col-span-full text-muted-foreground mb-1">Variáveis disponíveis (clique para copiar):</p>
          {TEMPLATE_VARIABLES.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => { navigator.clipboard.writeText(v.key); toast.success(`${v.key} copiado`); }}
              className="text-left px-2 py-1 rounded hover:bg-muted/50 transition-colors"
            >
              <code className="font-mono font-bold text-primary">{v.key}</code>
              <span className="text-muted-foreground"> — {v.desc}</span>
            </button>
          ))}
        </div>
        {previewMessage && (
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground mb-1">Prévia (primeiro contato):</p>
            <pre className="whitespace-pre-wrap text-sm text-foreground font-body">{previewMessage}</pre>
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-foreground">3. Ritmo e disparo</h3>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label className="text-xs">Disparos por hora</Label>
            <Input type="number" min={1} max={60} value={rate} disabled={running}
              onChange={(e) => setRate(Math.max(1, Math.min(60, Number(e.target.value) || 6)))}
              className="w-32" />
            <p className="text-xs text-muted-foreground mt-1">
              Padrão: 6/hora (1 msg a cada {Math.round(intervalMs / 1000)}s)
            </p>
          </div>
          <div className="flex gap-2 ml-auto">
            {!running ? (
              <Button onClick={start} disabled={!connected || queue.length === 0} className="gap-2">
                <Play className="w-4 h-4" /> Iniciar disparo
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={pauseToggle} className="gap-2">
                  <Pause className="w-4 h-4" /> {pausedRef.current ? "Retomar" : "Pausar"}
                </Button>
                <Button variant="destructive" onClick={stop} className="gap-2">
                  <Square className="w-4 h-4" /> Parar
                </Button>
              </>
            )}
          </div>
        </div>
        {!connected && (
          <p className="mt-3 text-xs text-yellow-700 dark:text-yellow-500">
            ⚠ Conecte o WhatsApp acima antes de iniciar.
          </p>
        )}
      </div>

      {/* Progresso */}
      {queue.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="grid grid-cols-4 gap-3 mb-4">
            <StatCard label="Total" value={stats.total} />
            <StatCard label="Enviados" value={stats.enviados} tone="green" />
            <StatCard label="Pendentes" value={stats.pendentes} tone="yellow" />
            <StatCard label="Erros" value={stats.erros} tone="red" />
          </div>
          <div className="max-h-[360px] overflow-auto border border-border rounded-lg divide-y divide-border">
            {queue.map((q, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
                <span className="w-6 text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                {q.status === "enviado" ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> :
                 q.status === "erro" ? <XCircle className="w-4 h-4 text-destructive shrink-0" /> :
                 <Clock className="w-4 h-4 text-muted-foreground shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {q.contact.nome || "(sem nome)"} · <span className="font-mono text-xs text-muted-foreground">{q.contact.whatsapp}</span>
                  </p>
                  {q.error && <p className="text-xs text-destructive truncate">{q.error}</p>}
                </div>
                {q.sentAt && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(q.sentAt).toLocaleTimeString("pt-BR")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, tone }: { label: string; value: number; tone?: "green" | "yellow" | "red" }) => {
  const cls = tone === "green" ? "text-green-700 dark:text-green-400"
    : tone === "yellow" ? "text-yellow-700 dark:text-yellow-400"
    : tone === "red" ? "text-red-700 dark:text-red-400"
    : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-display font-bold text-2xl ${cls}`}>{value}</p>
    </div>
  );
};

export default DispatchCampaign;
