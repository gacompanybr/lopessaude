import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Lead } from "@/lib/leads";
import { STATUS_LABELS, ORIGEM_LABELS } from "@/lib/leads";

export function exportLeadsToPdf(leads: Lead[], filtersSummary?: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const now = new Date().toLocaleString("pt-BR");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 60, 120);
  doc.text("Lopes Saúde - CRM de Leads", 40, 40);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`Gerado em: ${now}`, 40, 58);
  doc.text(`Total de leads: ${leads.length}`, 40, 72);
  if (filtersSummary) {
    doc.text(`Filtros: ${filtersSummary}`, 40, 86);
  }

  const rows = leads.map((l) => [
    l.name || "—",
    l.whatsapp || "—",
    l.city || "—",
    STATUS_LABELS[l.status],
    ORIGEM_LABELS[l.origem] || l.origem,
    new Date(l.created_at).toLocaleString("pt-BR"),
    l.message || "—",
  ]);

  autoTable(doc, {
    startY: filtersSummary ? 100 : 86,
    head: [["Nome", "WhatsApp", "Cidade", "Status", "Origem", "Criado em", "Mensagem"]],
    body: rows,
    styles: { font: "helvetica", fontSize: 9, cellPadding: 6, overflow: "linebreak" },
    headStyles: { fillColor: [30, 60, 120], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 248, 252] },
    columnStyles: {
      0: { cellWidth: 110 },
      1: { cellWidth: 95 },
      2: { cellWidth: 95 },
      3: { cellWidth: 70 },
      4: { cellWidth: 70 },
      5: { cellWidth: 95 },
      6: { cellWidth: "auto" },
    },
    margin: { left: 40, right: 40 },
  });

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`leads-${stamp}.pdf`);
}
