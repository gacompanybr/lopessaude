import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Plus, Trash2, Webhook } from "lucide-react";
import { toast } from "sonner";

interface WebhookConfig {
  callback_url: string;
  verify_token: string;
  field: string;
}

interface Subscription {
  id: string;
  page_id: string;
  page_name: string | null;
  active: boolean;
  created_at: string;
}

const MetaWebhookCard = () => {
  const [config, setConfig] = useState<WebhookConfig | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageId, setPageId] = useState("");
  const [pageName, setPageName] = useState("");
  const [pageToken, setPageToken] = useState("");

  const loadSubs = async () => {
    const { data } = await supabase
      .from("meta_webhook_subscriptions")
      .select("id, page_id, page_name, active, created_at")
      .order("created_at", { ascending: false });
    setSubs((data as Subscription[]) || []);
  };

  useEffect(() => {
    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meta-leads-webhook?action=config`;
        const resp = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
          },
        });
        if (resp.ok) setConfig(await resp.json());
      } catch (e) {
        console.warn("[MetaWebhookCard] config:", e);
      }
      await loadSubs();
      setLoading(false);
    })();
  }, []);

  const copy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copiado`);
  };

  const addPage = async () => {
    if (!pageId.trim() || !pageToken.trim()) {
      toast.error("Informe o ID da página e o token de acesso da página.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("meta_webhook_subscriptions").insert({
      page_id: pageId.trim(),
      page_name: pageName.trim() || null,
      page_access_token: pageToken.trim(),
      active: true,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPageId("");
    setPageName("");
    setPageToken("");
    toast.success("Página conectada.");
    loadSubs();
  };

  const removePage = async (id: string) => {
    const { error } = await supabase.from("meta_webhook_subscriptions").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Página removida.");
    loadSubs();
  };

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="w-5 h-5" /> Webhook de Leads do Meta Ads
        </CardTitle>
        <CardDescription>
          Quando o Meta disparar um lead (Lead Ads / Formulário Instantâneo), ele entra
          automaticamente no CRM com a tag Meta Ads — com nome, telefone e campanha quando disponíveis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <>
            {config && (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">URL de callback</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={config.callback_url} className="font-mono text-xs" />
                    <Button variant="outline" size="icon" onClick={() => copy(config.callback_url, "URL")}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Token de verificação</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={config.verify_token} className="font-mono text-xs" />
                    <Button variant="outline" size="icon" onClick={() => copy(config.verify_token, "Token")}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  No app do Meta (developers.facebook.com) → Webhooks → Página → assine o campo{" "}
                  <strong>leadgen</strong> usando a URL e o token acima.
                </p>
              </div>
            )}

            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-sm font-medium">Páginas conectadas</p>
              {subs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma página conectada ainda.</p>
              ) : (
                <ul className="space-y-2">
                  {subs.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                    >
                      <span className="text-sm">
                        {s.page_name || "Página"}{" "}
                        <span className="text-muted-foreground font-mono text-xs">{s.page_id}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant={s.active ? "default" : "secondary"}>
                          {s.active ? "Ativa" : "Inativa"}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => removePage(s.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label className="text-xs">ID da página</Label>
                  <Input value={pageId} onChange={(e) => setPageId(e.target.value)} placeholder="1234567890" />
                </div>
                <div>
                  <Label className="text-xs">Nome (opcional)</Label>
                  <Input value={pageName} onChange={(e) => setPageName(e.target.value)} placeholder="Lopes Saúde" />
                </div>
                <div>
                  <Label className="text-xs">Token de acesso da página</Label>
                  <Input
                    type="password"
                    value={pageToken}
                    onChange={(e) => setPageToken(e.target.value)}
                    placeholder="EAAG…"
                  />
                </div>
              </div>
              <Button onClick={addPage} disabled={saving} className="gap-2">
                <Plus className="w-4 h-4" /> Conectar página
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MetaWebhookCard;
