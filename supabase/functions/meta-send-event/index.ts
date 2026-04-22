// Edge Function: meta-send-event
// Envia eventos do CRM para a Meta Conversions API quando o status do lead muda.
// Sempre registra um log em meta_integration_logs e atualiza os campos técnicos
// do lead. NUNCA expõe o access token ao frontend.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const META_GRAPH_VERSION = "v21.0";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Normaliza telefone: só dígitos, com DDI Brasil quando faltar
function normalizePhone(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  if (digits.length >= 10 && digits.length <= 11) return `55${digits}`;
  return digits;
}

interface RequestBody {
  lead_id: string;
  event_name: string; // ex: "Novo", "Agendado", "Convertido", "Perdido"
  old_status?: string | null;
  // override opcional do tracking vindo do client (já capturado no form)
  tracking?: {
    fbc?: string | null;
    fbp?: string | null;
    ctwa_clid?: string | null;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const META_DATASET_ID = Deno.env.get("META_DATASET_ID");
  const META_ACCESS_TOKEN = Deno.env.get("META_ACCESS_TOKEN");
  const META_TEST_EVENT_CODE = Deno.env.get("META_TEST_EVENT_CODE") || null;

  // Auth: precisa de usuário autenticado (qualquer atendente do CRM pode disparar)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const callerUserId = userData.user.id;

  if (!META_DATASET_ID || !META_ACCESS_TOKEN) {
    return new Response(
      JSON.stringify({ error: "Meta credentials not configured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!body.lead_id || !body.event_name) {
    return new Response(
      JSON.stringify({ error: "lead_id and event_name are required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Carrega o lead
  const { data: lead, error: leadErr } = await admin
    .from("leads")
    .select("*")
    .eq("id", body.lead_id)
    .single();
  if (leadErr || !lead) {
    return new Response(
      JSON.stringify({ error: "Lead not found", details: leadErr?.message }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Atualiza tracking se enviado
  const fbc = body.tracking?.fbc ?? lead.meta_fbc ?? null;
  const fbp = body.tracking?.fbp ?? lead.meta_fbp ?? null;
  const ctwa_clid = body.tracking?.ctwa_clid ?? lead.meta_ctwa_clid ?? null;

  // Monta user_data com hash SHA-256 nos PII
  const user_data: Record<string, unknown> = {};
  if (lead.email) user_data.em = [await sha256Hex(lead.email)];
  if (lead.whatsapp)
    user_data.ph = [await sha256Hex(normalizePhone(lead.whatsapp))];
  if (lead.name) {
    const parts = lead.name.trim().split(/\s+/);
    user_data.fn = [await sha256Hex(parts[0])];
    if (parts.length > 1)
      user_data.ln = [await sha256Hex(parts.slice(1).join(" "))];
  }
  if (lead.city) user_data.ct = [await sha256Hex(lead.city)];
  if (lead.state) user_data.st = [await sha256Hex(lead.state)];
  user_data.country = [await sha256Hex("br")];

  // Identificadores SEM hash
  if (fbc) user_data.fbc = fbc;
  if (fbp) user_data.fbp = fbp;
  if (lead.meta_lead_id) user_data.lead_id = lead.meta_lead_id;

  const event_time = Math.floor(Date.now() / 1000);

  const custom_data: Record<string, unknown> = {
    event_source: "crm",
    lead_event_source: "CRM Lopes Saude",
    lead_status: body.event_name,
  };
  if (ctwa_clid) custom_data.ctwa_clid = ctwa_clid;

  const eventPayload = {
    event_name: body.event_name,
    event_time,
    action_source: "system_generated",
    user_data,
    custom_data,
  };

  const requestPayload: Record<string, unknown> = {
    data: [eventPayload],
  };
  if (META_TEST_EVENT_CODE) {
    requestPayload.test_event_code = META_TEST_EVENT_CODE;
  }

  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${META_DATASET_ID}/events?access_token=${META_ACCESS_TOKEN}`;

  let httpStatus = 0;
  let responseJson: unknown = null;
  let success = false;
  let errorMessage: string | null = null;

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    });
    httpStatus = resp.status;
    responseJson = await resp.json().catch(() => null);
    success = resp.ok;
    if (!resp.ok) {
      errorMessage =
        (responseJson as { error?: { message?: string } })?.error?.message ||
        `HTTP ${resp.status}`;
    }
  } catch (e) {
    errorMessage = (e as Error).message;
  }

  // Log da integração
  await admin.from("meta_integration_logs").insert({
    lead_id: lead.id,
    event_name: body.event_name,
    request_payload: requestPayload,
    response_payload: responseJson,
    success,
    error_message: errorMessage,
    test_event_code: META_TEST_EVENT_CODE,
    http_status: httpStatus,
  });

  // Atualiza o lead com retorno
  await admin
    .from("leads")
    .update({
      meta_fbc: fbc,
      meta_fbp: fbp,
      meta_ctwa_clid: ctwa_clid,
      sincronizado_meta: success,
      ultimo_status_enviado_meta: body.event_name,
      ultimo_envio_meta_em: new Date().toISOString(),
      ultimo_retorno_meta: responseJson as object | null,
      ultimo_erro_meta: errorMessage,
    })
    .eq("id", lead.id);

  // Histórico de status
  if (body.old_status !== undefined && body.old_status !== body.event_name) {
    await admin.from("lead_status_history").insert({
      lead_id: lead.id,
      old_status: body.old_status,
      new_status: body.event_name,
      changed_by: claimsData.claims.sub,
    });
  }

  return new Response(
    JSON.stringify({
      success,
      http_status: httpStatus,
      response: responseJson,
      error: errorMessage,
      test_mode: !!META_TEST_EVENT_CODE,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
