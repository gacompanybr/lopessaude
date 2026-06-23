import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { toast } from "sonner";
import { savePublicLead, sendMetaEvent, STATUS_TO_META_EVENT } from "@/lib/leads";
import { captureMetaTracking } from "@/lib/metaTracking";
import logo from "@/assets/lopes-logo.jpg";

const WHATSAPP_NUMBER = "551496684609";

const TIMING_OPTIONS = [
  { value: "Esta semana", label: "Esta semana", qualified: true },
  { value: "Este mês", label: "Este mês", qualified: true },
  { value: "Só pesquisando", label: "Só pesquisando", qualified: false },
] as const;

const REASON_OPTIONS = [
  "Limpeza / prevenção",
  "Dor de dente / urgência",
  "Estética / clareamento",
  "Avaliação geral",
] as const;

const maskPhoneBR = (raw: string) => {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const LandingAds = () => {
  const [searchParams] = useSearchParams();
  const campaign = useMemo(
    () =>
      searchParams.get("utm_campaign") ||
      searchParams.get("campaign") ||
      "meta_ads",
    [searchParams],
  );

  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    timing: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Bloqueia indexação reforçado
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow, noarchive, nosnippet";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.whatsapp || !form.timing || !form.reason) {
      toast.error("Preencha todos os campos");
      return;
    }

    const chosen = TIMING_OPTIONS.find((t) => t.value === form.timing);
    const qualified = chosen?.qualified ?? false;

    // Mensagem do WhatsApp pré-montada (no gesto do usuário p/ mobile)
    const waText = qualified
      ? `Olá, me chamo ${form.name}. Quero agendar uma consulta para ${form.reason}, de preferência ${form.timing.toLowerCase()}.`
      : `Olá, me chamo ${form.name}. Tenho interesse em ${form.reason}, mas ainda estou pesquisando. Podem me avisar quando houver disponibilidade?`;
    const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(waText)}`;
    const waWindow = window.open("about:blank", "_blank");

    setSubmitting(true);
    let savedOk = false;
    let createdId: string | null = null;
    let tracking: ReturnType<typeof captureMetaTracking> | null = null;

    try {
      tracking = captureMetaTracking();
      const message = [
        `Motivo: ${form.reason}`,
        `Prazo: ${form.timing}`,
        `Origem: campanha ${campaign}`,
        qualified ? null : "ATENÇÃO: lead marcou 'Só pesquisando'",
      ]
        .filter(Boolean)
        .join("\n");

      const created = await savePublicLead({
        name: form.name,
        whatsapp: form.whatsapp,
        city: "",
        message,
        origem: "site",
        status: "novo",
        tracking,
      });
      createdId = created.id;
      savedOk = true;

      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: "formulario_enviado",
        nome_formulario: "landing_ads",
        campanha: campaign,
        qualificado: qualified,
      });

      try {
        const fbq = (window as any).fbq;
        if (typeof fbq === "function") {
          fbq("track", "Lead", {
            content_name: "landing_ads",
            content_category: "whatsapp_form",
            campaign,
          });
          fbq("trackCustom", "WhatsAppConversation", {
            source: "landing_ads",
            campaign,
          });
        }
        if (typeof (window as any).__metaPixelFallback === "function") {
          (window as any).__metaPixelFallback("Lead", {
            content_name: "landing_ads",
            campaign,
          });
        }
      } catch (err) {
        console.warn("Pixel error", err);
      }

      toast.success(
        qualified
          ? "Vamos te chamar no WhatsApp agora!"
          : "Recebemos seu contato. Entraremos em contato quando houver disponibilidade.",
      );
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao enviar", {
        description: err?.message || "Tente novamente em instantes.",
      });
    } finally {
      setSubmitting(false);
    }

    if (savedOk) {
      if (createdId) {
        sendMetaEvent({
          lead_id: createdId,
          event_name: STATUS_TO_META_EVENT.novo,
          tracking,
        });
      }
      if (waWindow && !waWindow.closed) waWindow.location.href = waUrl;
      else window.location.href = waUrl;
    } else if (waWindow && !waWindow.closed) {
      waWindow.close();
    }
  };

  const labelClass = "block text-xs font-semibold text-foreground mb-1.5";
  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors";

  return (
    <>
      <Helmet>
        <title>Agende sua consulta — Clínica Lopes</title>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <meta name="googlebot" content="noindex, nofollow" />
      </Helmet>

      <main className="min-h-screen bg-background flex items-start justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-4">
            <img
              src={logo}
              alt="Clínica Lopes"
              className="h-12 w-auto object-contain"
              loading="eager"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-center leading-tight">
            Agende sua consulta odontológica
          </h1>
          <p className="text-xs text-muted-foreground text-center mt-2 mb-5">
            Atendimento particular — sem convênio/SUS
          </p>

          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-2xl shadow-sm border border-border p-5 sm:p-6 space-y-4"
          >
            <div>
              <label className={labelClass}>Nome completo</label>
              <input
                type="text"
                required
                autoComplete="name"
                placeholder="Seu nome completo"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>WhatsApp (com DDD)</label>
              <input
                type="tel"
                required
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(14) 99999-9999"
                value={form.whatsapp}
                onChange={(e) =>
                  setForm({ ...form, whatsapp: maskPhoneBR(e.target.value) })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Quando você quer agendar sua consulta?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TIMING_OPTIONS.map((opt) => {
                  const active = form.timing === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, timing: opt.value })}
                      className={`px-2 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border hover:border-primary/60"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={labelClass}>O que você precisa?</label>
              <div className="grid grid-cols-2 gap-2">
                {REASON_OPTIONS.map((opt) => {
                  const active = form.reason === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setForm({ ...form, reason: opt })}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors text-left ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border hover:border-primary/60"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity rounded-xl disabled:opacity-60"
            >
              {submitting ? "Enviando..." : "Quero agendar agora"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
};

export default LandingAds;
