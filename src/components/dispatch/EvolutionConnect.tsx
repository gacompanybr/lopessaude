import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, QrCode, LogOut, CheckCircle2, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import {
  fetchConnectionState,
  fetchQrCode,
  getEvolutionConfig,
  logoutInstance,
  type EvolutionConfig,
} from "@/lib/evolution";

interface Props {
  onStatusChange?: (connected: boolean) => void;
}

const EvolutionConnect = ({ onStatusChange }: Props) => {
  const [cfg] = useState<EvolutionConfig>(getEvolutionConfig());
  const [state, setState] = useState<string>("unknown");
  const [qr, setQr] = useState<{ base64?: string; code?: string; pairingCode?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const connected = state === "open";
  useEffect(() => { onStatusChange?.(connected); }, [connected, onStatusChange]);

  // Poll status quando temos config
  useEffect(() => {
    if (!cfg) return;
    let alive = true;
    const tick = async () => {
      try {
        const s = await fetchConnectionState(cfg);
        if (alive) setState(s);
        if (s === "open" && qr) setQr(null);
      } catch { /* ignore polling errors */ }
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => { alive = false; clearInterval(id); };
  }, [cfg, qr]);

  const handleGenerateQr = async () => {
    if (!cfg) return;
    setLoading(true);
    setQr(null);
    try {
      const q = await fetchQrCode(cfg);
      setQr(q);
      if (!q.base64 && !q.code && !q.pairingCode) toast.info("QR não retornado. Verifique a instância.");
    } catch (e: any) {
      toast.error(`Erro ao gerar QR: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckNow = async () => {
    if (!cfg) return;
    setChecking(true);
    try {
      const s = await fetchConnectionState(cfg);
      setState(s);
      toast.success(`Status: ${s}`);
    } catch (e: any) {
      toast.error(`Erro: ${e.message}`);
    } finally { setChecking(false); }
  };

  const handleLogout = async () => {
    if (!cfg) return;
    if (!confirm("Desconectar WhatsApp desta instância?")) return;
    try {
      await logoutInstance(cfg);
      toast.success("Desconectado");
      setState("close");
    } catch (e: any) {
      toast.error(`Erro: ${e.message}`);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {connected ? (
            <Wifi className="w-5 h-5 text-green-600" />
          ) : (
            <WifiOff className="w-5 h-5 text-muted-foreground" />
          )}
          <div>
            <h3 className="font-display font-bold text-foreground">Conexão WhatsApp (Evolution API)</h3>
            <p className="text-xs text-muted-foreground">
              Status: <span className={`font-semibold ${connected ? "text-green-600" : "text-yellow-600"}`}>
                {state === "open" ? "Conectado" : state === "connecting" ? "Conectando..." : state === "close" ? "Desconectado" : state}
              </span>
              {cfg && <> · Instância: <span className="font-mono">{cfg.instance}</span></>}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {cfg && (
            <>
              <Button variant="outline" size="sm" onClick={handleCheckNow} disabled={checking} className="gap-2">
                {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Verificar
              </Button>
            </>
          )}
        </div>
      </div>

      {cfg && (
        <div className="space-y-3">
          {connected ? (
            <div className="flex items-center justify-between gap-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium text-sm">WhatsApp conectado e pronto para disparar</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-destructive">
                <LogOut className="w-4 h-4" /> Desconectar
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button onClick={handleGenerateQr} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                {qr ? "Gerar novo QR" : "Gerar QR Code"}
              </Button>
              {qr?.base64 && (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={qr.base64.startsWith("data:") ? qr.base64 : `data:image/png;base64,${qr.base64}`}
                    alt="QR WhatsApp"
                    className="w-56 h-56 border border-border rounded-lg bg-white"
                  />
                  <p className="text-xs text-muted-foreground">Abra o WhatsApp → Aparelhos conectados → Conectar aparelho</p>
                </div>
              )}
              {qr?.pairingCode && (
                <div className="bg-muted/50 border border-border rounded-lg px-4 py-3">
                  <p className="text-xs text-muted-foreground">Código de pareamento:</p>
                  <p className="font-mono text-2xl font-bold tracking-widest">{qr.pairingCode}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EvolutionConnect;
