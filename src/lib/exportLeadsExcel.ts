import * as XLSX from "xlsx";
import type { Lead } from "@/lib/leads";
import { STATUS_LABELS, ORIGEM_LABELS } from "@/lib/leads";

export function exportLeadsToExcel(leads: Lead[]) {
  const rows = leads.map((l) => ({
    Nome: l.name || "",
    WhatsApp: l.whatsapp || "",
    Cidade: l.city || "",
    Status: STATUS_LABELS[l.status],
    Origem: ORIGEM_LABELS[l.origem] || l.origem,
    "Criado em": new Date(l.created_at).toLocaleString("pt-BR"),
    Mensagem: l.message || "",
    Notas: l.notes || "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 24 }, { wch: 18 }, { wch: 20 }, { wch: 14 },
    { wch: 16 }, { wch: 20 }, { wch: 50 }, { wch: 30 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads");

  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `leads-${stamp}.xlsx`);
}
