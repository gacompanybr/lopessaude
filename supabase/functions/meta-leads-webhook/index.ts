// Edge Function: meta-leads-webhook
// Recebe webhooks de "leadgen" do Meta (Lead Ads) e cria o lead direto no CRM.
// - GET  : handshake de verificação do Meta (hub.challenge)
// - POST : payload de leadgen -> busca os dados do lead na Graph API -> insere em public.leads
// Também expõe GET ?action=config (com JWT de admin) para o CRM mostrar a URL + verify token.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GRAPH = "https://graph.facebook.com/v21.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const VERIFY_TOKEN = Deno.env.get("META_WEBHOOK_VERIFY_TOKEN") || "";
const FALLBACK_TOKEN = Deno.env.get("META_ACCESS_TOKEN") || "";

interface FieldData {
  name: string;
  values: string[];
}

function pick(fields: FieldData[], keys: string[]): string | null {
  for (const k of keys) {
    const f = fields.find(
      (x) => (x.name || "").toLowerCase().replace(/\s+/g, "_") === k
    );
    if (f?.values?.length) return String(f.values[0]).trim();
  }
  return null;
}

async function getPageToken(admin: ReturnType<typeof createClient>, pageId: string) {
  const { data } = await admin
    .from("meta_webhook_subscriptions")
    .select("page_access_token")
    .eq("page_id", pageId)
    .eq("active", true)
    .maybeSingle();
  return (data as { page_access_token?: string } | null)?.page_access_token || FALLBACK_TOKEN;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  // ---- Config (para o CRM exibir a URL e o verify token) ----
  if (req.method === "GET" && url.searchParams.get("action") === "config") {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: u.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(
      JSON.stringify({
        callback_url: `${SUPABASE_URL}/functions/v1/meta-leads-webhook`,
        verify_token: VERIFY_TOKEN,
        field: "leadgen",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // ---- Handshake de verificação do Meta ----
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge") || "";
    if (mode === "subscribe" && VERIFY_TOKEN && token === VERIFY_TOKEN) {
      return new Response(challenge, {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }
    return new Response("Forbidden", { status: 403, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return new Response("Bad request", { status: 400, headers: corsHeaders });
  }

  const results: unknown[] = [];

  for (const entry of payload?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      if (change?.field !== "leadgen") continue;
      const v = change.value || {};
      const leadgenId: string | undefined = v.leadgen_id;
      const pageId: string = String(v.page_id ?? entry.id ?? "");
      if (!leadgenId) continue;

      // Idempotência
      const { data: existing } = await admin
        .from("leads")
        .select("id")
        .eq("meta_lead_id", leadgenId)
        .maybeSingle();
      if (existing) {
        results.push({ leadgenId, skipped: "already_exists" });
        continue;
      }

      let name: string | null = null;
      let phone: string | null = null;
      let email: string | null = null;
      let city: string | null = null;
      let state: string | null = null;
      let formName: string | null = null;
      let campaignName: string | null = null;
      let adName: string | null = null;
      let adsetName: string | null = null;
      let campaignId: string | null = v.campaign_id ?? null;
      let adId: string | null = v.ad_id ?? null;
      let adsetId: string | null = v.adgroup_id ?? null;
      let fetchError: string | null = null;

      const token = await getPageToken(admin, pageId);
      if (token) {
        try {
          const fields =
            "id,created_time,field_data,form_id,campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name";
          const resp = await fetch(
            `${GRAPH}/${leadgenId}?fields=${fields}&access_token=${token}`
          );
          const json = await resp.json();
          if (resp.ok) {
            const fd: FieldData[] = json.field_data || [];
            name = pick(fd, ["full_name", "nome", "name", "first_name"]);
            phone = pick(fd, ["phone_number", "telefone", "whatsapp", "phone"]);
            email = pick(fd, ["email", "e-mail"]);
            city = pick(fd, ["city", "cidade"]);
            state = pick(fd, ["state", "estado"]);
            campaignId = json.campaign_id ?? campaignId;
            campaignName = json.campaign_name ?? null;
            adsetId = json.adset_id ?? adsetId;
            adsetName = json.adset_name ?? null;
            adId = json.ad_id ?? adId;
            adName = json.ad_name ?? null;
            formName = json.form_id ?? null;
          } else {
            fetchError = json?.error?.message || `HTTP ${resp.status}`;
          }
        } catch (e) {
          fetchError = (e as Error).message;
        }
      } else {
        fetchError = "Nenhum token de página configurado para esta página.";
      }

      const messageLines = [
        `Lead recebido automaticamente do Meta Ads (Lead Ads).`,
        campaignName ? `Campanha: ${campaignName}` : null,
        adsetName ? `Conjunto: ${adsetName}` : null,
        adName ? `Anúncio: ${adName}` : null,
        fetchError ? `Obs.: não foi possível puxar os dados completos (${fetchError}).` : null,
      ].filter(Boolean);

      const insertPayload = {
        name: name,
        whatsapp: phone || "Não informado (Meta Ads)",
        city: city || "Não informado",
        state,
        email,
        message: messageLines.join("\n"),
        status: "novo",
        origem: "redes_sociais",
        meta_lead_id: leadgenId,
        meta_page_id: pageId || null,
        meta_form_id: v.form_id ?? null,
        meta_form_name: formName,
        meta_campaign_id: campaignId,
        meta_campaign_name: campaignName,
        meta_adset_id: adsetId,
        meta_adset_name: adsetName,
        meta_ad_id: adId,
        meta_ad_name: adName,
        utm_source: "facebook",
        utm_medium: "paid_social",
        utm_campaign: campaignName,
        landing_page: "meta_lead_ads",
      };

      const { data: inserted, error } = await admin
        .from("leads")
        .insert(insertPayload)
        .select("id")
        .single();

      await admin.from("meta_integration_logs").insert({
        lead_id: inserted?.id ?? null,
        event_name: "leadgen_webhook",
        request_payload: change,
        response_payload: { insert_error: error?.message ?? null, fetchError },
        success: !error,
        error_message: error?.message ?? fetchError,
        http_status: 200,
      });

      results.push({ leadgenId, lead_id: inserted?.id ?? null, error: error?.message ?? null });
    }
  }

  // Meta exige 200 sempre, senão reenvia/desativa a assinatura.
  return new Response(JSON.stringify({ received: true, results }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
