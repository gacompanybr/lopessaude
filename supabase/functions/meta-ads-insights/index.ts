// Meta Ads Insights — busca dados de performance via Meta Marketing API
// Endpoints: account info, campaigns list, insights agregados e por dia
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const META_API_VERSION = "v21.0";
const META_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

interface InsightRow {
  date_start?: string;
  date_stop?: string;
  campaign_id?: string;
  campaign_name?: string;
  spend?: string;
  impressions?: string;
  reach?: string;
  clicks?: string;
  cpc?: string;
  cpm?: string;
  ctr?: string;
  actions?: { action_type: string; value: string }[];
  cost_per_action_type?: { action_type: string; value: string }[];
}

const num = (v: unknown) => (v == null ? 0 : Number(v) || 0);

function extractLeads(actions?: { action_type: string; value: string }[]) {
  if (!actions) return 0;
  let total = 0;
  for (const a of actions) {
    if (
      a.action_type === "lead" ||
      a.action_type === "onsite_conversion.lead_grouped" ||
      a.action_type === "offsite_conversion.fb_pixel_lead" ||
      a.action_type.endsWith(".lead")
    ) {
      total += num(a.value);
    }
  }
  return total;
}

async function metaFetch(path: string, token: string, params: Record<string, string> = {}) {
  const url = new URL(`${META_BASE}${path}`);
  url.searchParams.set("access_token", token);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const r = await fetch(url.toString());
  const data = await r.json();
  if (!r.ok) {
    throw new Error(
      `Meta API ${r.status}: ${data?.error?.message || JSON.stringify(data)}`
    );
  }
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const token = Deno.env.get("META_ACCESS_TOKEN");
    const accountId = Deno.env.get("META_AD_ACCOUNT_ID");
    if (!token) throw new Error("META_ACCESS_TOKEN não configurado");
    if (!accountId) throw new Error("META_AD_ACCOUNT_ID não configurado");

    const url = new URL(req.url);
    const datePreset = url.searchParams.get("date_preset") || "last_30d";
    const since = url.searchParams.get("since");
    const until = url.searchParams.get("until");
    const actId = accountId.startsWith("act_") ? accountId : `act_${accountId}`;

    const timeRangeParam: Record<string, string> = {};
    if (since && until) {
      timeRangeParam.time_range = JSON.stringify({ since, until });
    } else {
      timeRangeParam.date_preset = datePreset;
    }

    // 1) Account info
    const account = await metaFetch(`/${actId}`, token, {
      fields: "name,currency,account_status,timezone_name",
    });

    // 2) Insights agregados (totais)
    const totals = await metaFetch(`/${actId}/insights`, token, {
      ...timeRangeParam,
      fields:
        "spend,impressions,reach,clicks,cpc,cpm,ctr,actions,cost_per_action_type",
      level: "account",
    });

    // 3) Insights por dia (evolução)
    const daily = await metaFetch(`/${actId}/insights`, token, {
      ...timeRangeParam,
      fields: "spend,impressions,clicks,actions",
      level: "account",
      time_increment: "1",
      limit: "365",
    });

    // 4) Insights por campanha
    const byCampaign = await metaFetch(`/${actId}/insights`, token, {
      ...timeRangeParam,
      fields:
        "campaign_id,campaign_name,spend,impressions,reach,clicks,cpc,cpm,ctr,actions,cost_per_action_type",
      level: "campaign",
      limit: "200",
    });

    // 5) Status das campanhas (effective_status)
    const campaignsMeta = await metaFetch(`/${actId}/campaigns`, token, {
      fields: "id,name,effective_status,objective,daily_budget,lifetime_budget",
      limit: "200",
    });
    const statusMap = new Map<string, string>();
    const objectiveMap = new Map<string, string>();
    for (const c of campaignsMeta.data || []) {
      statusMap.set(c.id, c.effective_status);
      objectiveMap.set(c.id, c.objective);
    }

    // ---- Normaliza ----
    const t: InsightRow = (totals.data || [])[0] || {};
    const totalLeads = extractLeads(t.actions);
    const totalSpend = num(t.spend);
    const summary = {
      spend: totalSpend,
      impressions: num(t.impressions),
      reach: num(t.reach),
      clicks: num(t.clicks),
      cpc: num(t.cpc),
      cpm: num(t.cpm),
      ctr: num(t.ctr),
      leads: totalLeads,
      cost_per_lead: totalLeads > 0 ? totalSpend / totalLeads : 0,
    };

    const dailySeries = (daily.data || [])
      .map((row: InsightRow) => ({
        date: row.date_start,
        spend: num(row.spend),
        impressions: num(row.impressions),
        clicks: num(row.clicks),
        leads: extractLeads(row.actions),
      }))
      .sort((a: { date?: string }, b: { date?: string }) =>
        (a.date || "").localeCompare(b.date || "")
      );

    const campaigns = (byCampaign.data || []).map((row: InsightRow) => {
      const leads = extractLeads(row.actions);
      const spend = num(row.spend);
      return {
        campaign_id: row.campaign_id,
        campaign_name: row.campaign_name,
        status: statusMap.get(row.campaign_id || "") || "—",
        objective: objectiveMap.get(row.campaign_id || "") || "—",
        spend,
        impressions: num(row.impressions),
        reach: num(row.reach),
        clicks: num(row.clicks),
        cpc: num(row.cpc),
        cpm: num(row.cpm),
        ctr: num(row.ctr),
        leads,
        cost_per_lead: leads > 0 ? spend / leads : 0,
      };
    });

    return new Response(
      JSON.stringify({
        account: {
          id: actId,
          name: account.name,
          currency: account.currency,
          status: account.account_status,
          timezone: account.timezone_name,
        },
        period: { date_preset: datePreset, since, until },
        summary,
        daily: dailySeries,
        campaigns,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    console.error("[meta-ads-insights]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
