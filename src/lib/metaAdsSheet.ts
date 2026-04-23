import * as XLSX from "xlsx";

/**
 * Linha normalizada de campanha. Mapeamos a planilha do Meta Ads
 * (que usa "Contatos por mensagem" e "Novos contatos") para a semântica
 * pedida no dashboard (cliques / conversões), preservando os números reais.
 */
export interface CampaignRow {
  campaign: string;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number; // = "Contatos por mensagem"
  conversions: number; // = "Novos contatos"
  cpm: number | null;
  costPerConversion: number | null;
}

export interface MetaAdsSummary {
  totalSpend: number;
  totalImpressions: number;
  totalReach: number;
  totalClicks: number;
  totalConversions: number;
  cpc: number; // custo / cliques
  ctr: number; // cliques / impressões
  conversionRate: number; // conversões / cliques
  costPerConversion: number; // custo / conversões
  cpm: number;
  campaignsCount: number;
  periodStart: string | null;
  periodEnd: string | null;
}

export interface MetaAdsDataset {
  summary: MetaAdsSummary;
  campaigns: CampaignRow[];
  sourceSheet: string;
}

const HEADER_ALIASES: Record<keyof Omit<CampaignRow, "campaign" | "status" | "startDate" | "endDate">, string[]> = {
  spend: ["valor gasto", "valor usado", "gasto", "custo", "investimento", "amount spent"],
  impressions: ["impressões", "impressoes", "impressions"],
  reach: ["alcance", "reach"],
  clicks: ["contatos por mensagem", "total de contatos", "cliques", "clicks", "link clicks"],
  conversions: ["novos contatos", "novos contatos de mensagem", "resultados", "conversões", "conversoes", "conversions", "leads"],
  cpm: ["cpm"],
  costPerConversion: ["custo por novo contato", "custo por resultado", "custo por conversão", "cost per result"],
};

const CAMPAIGN_ALIASES = ["campanha", "nome da campanha", "campaign name", "campaign"];
const STATUS_ALIASES = ["status", "veiculação da campanha", "veiculacao da campanha", "delivery"];
const START_ALIASES = ["início", "inicio", "início dos relatórios", "reporting starts"];
const END_ALIASES = ["fim", "encerramento dos relatórios", "reporting ends"];

const norm = (s: unknown) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const findKey = (row: Record<string, unknown>, aliases: string[]): string | null => {
  const keys = Object.keys(row);
  const normalized = keys.map((k) => ({ raw: k, n: norm(k) }));
  for (const alias of aliases) {
    const a = norm(alias);
    const exact = normalized.find((k) => k.n === a);
    if (exact) return exact.raw;
  }
  for (const alias of aliases) {
    const a = norm(alias);
    const partial = normalized.find((k) => k.n.includes(a));
    if (partial) return partial.raw;
  }
  return null;
};

/** Converte BR/US, "R$ 1.234,56", "12,5%" etc. em número. */
export const toNumber = (v: unknown): number => {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  let s = String(v).trim();
  if (!s) return 0;
  s = s.replace(/r\$\s?/i, "").replace(/%/g, "").replace(/\s/g, "");
  // BR: ponto milhar, vírgula decimal
  if (/,\d{1,2}$/.test(s) && /\./.test(s)) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (/,\d+$/.test(s)) {
    s = s.replace(",", ".");
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

const toDateString = (v: unknown): string | null => {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  if (!s) return null;
  // Excel pode passar como número serial; aqui já vem formatado por sheet_to_json
  return s;
};

const pickSheet = (wb: XLSX.WorkBook): string => {
  const preferred = ["campanhas tratadas", "dados tratados", "tratados"];
  const names = wb.SheetNames;
  for (const p of preferred) {
    const m = names.find((n) => norm(n).includes(p));
    if (m) return m;
  }
  // fallback: primeira aba que tenha mais de 1 linha de dados e cabeçalho com "Campanha"
  for (const n of names) {
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[n], { defval: null });
    if (json.length && findKey(json[0], CAMPAIGN_ALIASES)) return n;
  }
  return names[0];
};

export const parseMetaAdsWorkbook = (wb: XLSX.WorkBook): MetaAdsDataset => {
  const sheetName = pickSheet(wb);
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[sheetName], { defval: null });
  if (!raw.length) {
    throw new Error("A aba selecionada está vazia.");
  }

  const sample = raw[0];
  const campaignKey = findKey(sample, CAMPAIGN_ALIASES);
  if (!campaignKey) {
    throw new Error("Não foi possível identificar a coluna de Campanha na planilha.");
  }
  const statusKey = findKey(sample, STATUS_ALIASES);
  const startKey = findKey(sample, START_ALIASES);
  const endKey = findKey(sample, END_ALIASES);

  const colKeys = {
    spend: findKey(sample, HEADER_ALIASES.spend),
    impressions: findKey(sample, HEADER_ALIASES.impressions),
    reach: findKey(sample, HEADER_ALIASES.reach),
    clicks: findKey(sample, HEADER_ALIASES.clicks),
    conversions: findKey(sample, HEADER_ALIASES.conversions),
    cpm: findKey(sample, HEADER_ALIASES.cpm),
    costPerConversion: findKey(sample, HEADER_ALIASES.costPerConversion),
  };

  const campaigns: CampaignRow[] = raw
    .map((row) => {
      const name = campaignKey ? String(row[campaignKey] ?? "").trim() : "";
      if (!name) return null;
      // Evitar linha de "total da conta" (sem nome ou marcada como total)
      if (/^total/i.test(name)) return null;
      const spend = colKeys.spend ? toNumber(row[colKeys.spend]) : 0;
      const impressions = colKeys.impressions ? toNumber(row[colKeys.impressions]) : 0;
      const reach = colKeys.reach ? toNumber(row[colKeys.reach]) : 0;
      const clicks = colKeys.clicks ? toNumber(row[colKeys.clicks]) : 0;
      const conversions = colKeys.conversions ? toNumber(row[colKeys.conversions]) : 0;
      const cpm = colKeys.cpm ? toNumber(row[colKeys.cpm]) : null;
      const costPerConversion = colKeys.costPerConversion ? toNumber(row[colKeys.costPerConversion]) : null;
      return {
        campaign: name,
        status: statusKey ? (row[statusKey] ? String(row[statusKey]) : null) : null,
        startDate: startKey ? toDateString(row[startKey]) : null,
        endDate: endKey ? toDateString(row[endKey]) : null,
        spend,
        impressions,
        reach,
        clicks,
        conversions,
        cpm: cpm && cpm > 0 ? cpm : impressions > 0 ? (spend / impressions) * 1000 : null,
        costPerConversion: costPerConversion && costPerConversion > 0 ? costPerConversion : conversions > 0 ? spend / conversions : null,
      } satisfies CampaignRow;
    })
    .filter((r): r is CampaignRow => r !== null);

  if (!campaigns.length) {
    throw new Error("Nenhuma linha de campanha válida encontrada.");
  }

  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalReach = campaigns.reduce((s, c) => s + c.reach, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);

  const summary: MetaAdsSummary = {
    totalSpend,
    totalImpressions,
    totalReach,
    totalClicks,
    totalConversions,
    cpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
    ctr: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
    conversionRate: totalClicks > 0 ? totalConversions / totalClicks : 0,
    costPerConversion: totalConversions > 0 ? totalSpend / totalConversions : 0,
    cpm: totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0,
    campaignsCount: campaigns.length,
    periodStart: campaigns.map((c) => c.startDate).filter(Boolean).sort()[0] ?? null,
    periodEnd: campaigns.map((c) => c.endDate).filter(Boolean).sort().slice(-1)[0] ?? null,
  };

  return { summary, campaigns, sourceSheet: sheetName };
};

export const parseMetaAdsFile = async (file: File): Promise<MetaAdsDataset> => {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  return parseMetaAdsWorkbook(wb);
};

/** Dataset embutido a partir da planilha modelo (`planilha_meta_ads_arrumada.xlsx`). */
export const DEFAULT_DATASET: MetaAdsDataset = (() => {
  const campaigns: CampaignRow[] = [
    {
      campaign: "CBO - REC - DUARTINA",
      status: "Ativa",
      startDate: "2026-04-01",
      endDate: "2026-04-22",
      spend: 153.73,
      impressions: 101133,
      reach: 28740,
      clicks: 2,
      conversions: 1,
      cpm: 1.520078,
      costPerConversion: 153.73,
    },
    {
      campaign: "CBO - LEAD - DUARTINA",
      status: "Ativa",
      startDate: "2026-04-01",
      endDate: "2026-04-22",
      spend: 40.2,
      impressions: 3885,
      reach: 2036,
      clicks: 3,
      conversions: 0,
      cpm: 10.34749,
      costPerConversion: null,
    },
  ];
  const totalSpend = 193.93;
  const totalImpressions = 105018;
  const totalClicks = 5;
  const totalConversions = 1;
  return {
    sourceSheet: "Campanhas Tratadas",
    campaigns,
    summary: {
      totalSpend,
      totalImpressions,
      totalReach: 30776,
      totalClicks,
      totalConversions,
      cpc: totalSpend / totalClicks,
      ctr: totalClicks / totalImpressions,
      conversionRate: totalConversions / totalClicks,
      costPerConversion: totalSpend / totalConversions,
      cpm: (totalSpend / totalImpressions) * 1000,
      campaignsCount: 2,
      periodStart: "2026-04-01",
      periodEnd: "2026-04-22",
    },
  };
})();

export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
export const formatInt = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
export const formatPct = (n: number, digits = 2) =>
  `${(n * 100).toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;
