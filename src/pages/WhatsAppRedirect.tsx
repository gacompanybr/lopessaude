import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { saveLead, sendMetaEvent, STATUS_TO_META_EVENT } from "@/lib/leads";
import { captureMetaTracking } from "@/lib/metaTracking";

const WHATSAPP_NUMBER = "551496684609";
const DEFAULT_MESSAGE = "Olá, vim pelo anúncio e gostaria de saber mais informações.";

/**
 * Página intermediária para campanhas Click-to-WhatsApp.
 *
 * Como usar no anúncio:
 *   https://lopessaude.com.br/wa
 *   https://lopessaude.com.br/wa?utm_source=google&utm_campaign=marca&msg=Quero%20agendar
 *
 * Parâmetros opcionais (querystring):
 *   - msg     → texto inicial da conversa
 *   - utm_*   → repassados para tracking
 *   - fbclid  → capturado automaticamente
 *   - ctwa_clid → capturado automaticamente
 *
 * Fluxo:
 *   1. Captura tracking (fbc/fbp/ctwa_clid/utms)
 *   2. Cria lead no CRM com origem "redes_sociais"
 *   3. Dispara evento "Novo" para a Meta
 *   4. Redireciona para o WhatsApp
 */
const WhatsAppRedirect = () => {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const customMessage = params.get("msg") || DEFAULT_MESSAGE;
    const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(
      customMessage
    )}`;

    const run = async () => {
      try {
        const tracking = captureMetaTracking();
        const utmSource = params.get("utm_source") || "";
        const utmCampaign = params.get("utm_campaign") || "";
        const utmMedium = params.get("utm_medium") || "";

        const noteParts = [
          "Lead Click-to-WhatsApp",
          utmSource && `utm_source=${utmSource}`,
          utmMedium && `utm_medium=${utmMedium}`,
          utmCampaign && `utm_campaign=${utmCampaign}`,
        ].filter(Boolean);

        const created = await saveLead({
          name: null,
          whatsapp: "pendente",
          city: "Não informado",
          message: customMessage,
          origem: "redes_sociais",
          status: "novo",
          notes: noteParts.join(" | "),
          tracking,
        });

        sendMetaEvent({
          lead_id: created.id,
          event_name: STATUS_TO_META_EVENT.novo,
          tracking,
        });
      } catch (err) {
        console.error("Erro ao registrar lead WA:", err);
      } finally {
        setStatus("ready");
        // Pequeno atraso para garantir que o evento foi disparado
        window.location.replace(waUrl);
      }
    };

    run();
  }, [params]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-6 h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Abrindo o WhatsApp...
        </h1>
        <p className="text-sm text-muted-foreground">
          {status === "error"
            ? "Tivemos um problema, mas você já pode continuar a conversa."
            : "Você será redirecionado em instantes."}
        </p>
      </div>
    </main>
  );
};

export default WhatsAppRedirect;
