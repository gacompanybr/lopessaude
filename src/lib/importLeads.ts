import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import type { LeadOrigem, LeadStatus, NewLeadInput } from "@/lib/leads";

const STATUS_VALUES: LeadStatus[] = ["novo", "em_contato", "agendado", "convertido", "perdido"];
const ORIGEM_VALUES: LeadOrigem[] = ["site", "manual", "whatsapp", "indicacao", "redes_sociais", "outro"];

const STATUS_ALIASES: Record<string, LeadStatus> = {
  "novo": "novo",
  "em contato": "em_contato",
  "em_contato": "em_contato",
  "agendado": "agendado",
  "convertido": "convertido",
  "perdido": "perdido",
};

const ORIGEM_ALIASES: Record<string, LeadOrigem> = {
  "site": "site",
  "manual": "manual",
  "whatsapp": "whatsapp",
  "indicacao": "indicacao",
  "indicação": "indicacao",
  "redes sociais": "redes_sociais",
  "redes_sociais": "redes_sociais",
  "outro": "outro",
};

export interface ImportResult {
  inserted: number;
  duplicates: number;
  errors: { row: number; reason: string }[];
  total: number;
}

const norm = (v: unknown) => String(v ?? "").trim();
const onlyDigits = (v: string) => v.replace(/\D/g, "");

function pickKey(row: Record<string, any>, keys: string[]): any {
  const lower = Object.keys(row).reduce<Record<string, string>>((acc, k) => {
    acc[k.toLowerCase().trim()] = k;
    return acc;
  }, {});
  for (const k of keys) {
    const real = lower[k.toLowerCase()];
    if (real !== undefined && row[real] !== undefined && row[real] !== null && String(row[real]).trim() !== "") {
      return row[real];
    }
  }
  return undefined;
}

async function parseFile(file: File): Promise<Record<string, any>[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });
}

export async function importLeadsFromFile(file: File): Promise<ImportResult> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!["xlsx", "xls", "csv"].includes(ext || "")) {
    throw new Error("Formato inválido. Envie um arquivo .xlsx ou .csv");
  }

  const rows = await parseFile(file);
  const result: ImportResult = { inserted: 0, duplicates: 0, errors: [], total: rows.length };

  if (rows.length === 0) {
    throw new Error("Planilha vazia ou sem dados na primeira aba.");
  }

  // Carrega telefones existentes para evitar duplicidade
  const { data: existing } = await supabase.from("leads").select("whatsapp");
  const existingPhones = new Set((existing || []).map((l) => onlyDigits(l.whatsapp || "")));
  const seenInBatch = new Set<string>();

  const toInsert: NewLeadInput[] = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // header = 1
    try {
      const name = norm(pickKey(row, ["nome", "name"]));
      const whatsappRaw = norm(pickKey(row, ["whatsapp", "telefone", "celular", "phone"]));
      const city = norm(pickKey(row, ["cidade", "city"]));
      const message = norm(pickKey(row, ["mensagem", "message", "obs", "observação", "observacao"]));
      const statusRaw = norm(pickKey(row, ["status"])).toLowerCase();
      const origemRaw = norm(pickKey(row, ["origem", "origin", "source"])).toLowerCase();
      const notes = norm(pickKey(row, ["notas", "notes"]));

      const phone = onlyDigits(whatsappRaw);
      if (!phone) {
        result.errors.push({ row: rowNum, reason: "WhatsApp/Telefone obrigatório" });
        return;
      }
      if (!city) {
        result.errors.push({ row: rowNum, reason: "Cidade obrigatória" });
        return;
      }
      if (existingPhones.has(phone) || seenInBatch.has(phone)) {
        result.duplicates += 1;
        return;
      }

      const status: LeadStatus = STATUS_ALIASES[statusRaw] || "novo";
      const origem: LeadOrigem = ORIGEM_ALIASES[origemRaw] || "manual";

      if (statusRaw && !STATUS_VALUES.includes(status)) {
        result.errors.push({ row: rowNum, reason: `Status inválido: ${statusRaw}` });
        return;
      }
      if (origemRaw && !ORIGEM_VALUES.includes(origem)) {
        result.errors.push({ row: rowNum, reason: `Origem inválida: ${origemRaw}` });
        return;
      }

      seenInBatch.add(phone);
      toInsert.push({
        name: name || null,
        whatsapp: phone,
        city,
        message: message || null,
        status,
        origem,
        notes: notes || null,
      });
    } catch (e: any) {
      result.errors.push({ row: rowNum, reason: e?.message || "Erro ao processar linha" });
    }
  });

  if (toInsert.length > 0) {
    const { error, data } = await supabase.from("leads").insert(toInsert).select("id");
    if (error) {
      throw new Error(`Erro ao salvar no banco: ${error.message}`);
    }
    result.inserted = data?.length || toInsert.length;
  }

  return result;
}

export function downloadLeadsTemplate() {
  const sample = [
    {
      nome: "João Silva",
      whatsapp: "14999999999",
      cidade: "Marília",
      origem: "site",
      status: "novo",
      mensagem: "Quero saber mais sobre consulta",
      notas: "",
    },
    {
      nome: "Maria Souza",
      whatsapp: "14988887777",
      cidade: "Bauru",
      origem: "indicacao",
      status: "em_contato",
      mensagem: "",
      notas: "Indicada pelo Dr. X",
    },
  ];
  const ws = XLSX.utils.json_to_sheet(sample);
  ws["!cols"] = [
    { wch: 24 }, { wch: 18 }, { wch: 20 },
    { wch: 16 }, { wch: 14 }, { wch: 40 }, { wch: 30 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads");
  XLSX.writeFile(wb, "modelo-importacao-leads.xlsx");
}
