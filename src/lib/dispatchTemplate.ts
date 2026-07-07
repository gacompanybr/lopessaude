import * as XLSX from "xlsx";

export interface DispatchContact {
  nome: string;
  whatsapp: string;
  valor?: string;
  parcelas?: string;
  situacao?: string;
  vencimento?: string;
  documento?: string;
  raw: Record<string, any>;
}

const norm = (s: string) =>
  s.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const PICK: Record<keyof Omit<DispatchContact, "raw">, string[]> = {
  nome: ["nome", "name", "descricao", "descrição", "cliente", "paciente"],
  whatsapp: ["whatsapp", "telefone", "celular", "phone", "contato", "numero", "número"],
  valor: ["valor", "valor devido", "valor pendente", "amount"],
  parcelas: ["parcelas pagas/parcelas totais", "parcelas", "parcela"],
  situacao: ["situacao", "situação", "status"],
  vencimento: ["data de vencimento", "vencimento", "due date"],
  documento: ["documento", "cpf", "cnpj", "doc"],
};

function pick(row: Record<string, any>, keys: string[]): string | undefined {
  const map: Record<string, string> = {};
  Object.keys(row).forEach((k) => (map[norm(k)] = k));
  for (const k of keys) {
    const real = map[norm(k)];
    if (real && row[real] !== undefined && row[real] !== null && String(row[real]).trim() !== "") {
      return String(row[real]).trim();
    }
  }
  return undefined;
}

export async function parseDispatchFile(file: File): Promise<DispatchContact[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });

  return rows
    .map((row) => {
      const contact: DispatchContact = {
        nome: pick(row, PICK.nome) || "",
        whatsapp: pick(row, PICK.whatsapp) || "",
        valor: pick(row, PICK.valor),
        parcelas: pick(row, PICK.parcelas),
        situacao: pick(row, PICK.situacao),
        vencimento: pick(row, PICK.vencimento),
        documento: pick(row, PICK.documento),
        raw: row,
      };
      return contact;
    })
    .filter((c) => c.whatsapp && c.whatsapp.replace(/\D/g, "").length >= 10);
}

export function renderTemplate(template: string, c: DispatchContact): string {
  const primeiroNome = (c.nome || "").split(" ")[0] || c.nome || "";
  const vars: Record<string, string> = {
    nome: c.nome || "",
    primeiro_nome: primeiroNome,
    whatsapp: c.whatsapp || "",
    valor: c.valor ? formatCurrency(c.valor) : "",
    valor_bruto: c.valor || "",
    parcelas: c.parcelas || "",
    situacao: c.situacao || "",
    vencimento: c.vencimento || "",
    documento: c.documento || "",
  };
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = vars[key.toLowerCase()];
    return v !== undefined ? v : `{${key}}`;
  });
}

function formatCurrency(v: string): string {
  const n = Number(String(v).replace(/[^\d,.-]/g, "").replace(",", "."));
  if (Number.isFinite(n)) {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  return v;
}

export const TEMPLATE_VARIABLES: { key: string; desc: string }[] = [
  { key: "{nome}", desc: "Nome completo do contato" },
  { key: "{primeiro_nome}", desc: "Apenas o primeiro nome" },
  { key: "{valor}", desc: "Valor devido (formatado em R$)" },
  { key: "{parcelas}", desc: "Parcelas pagas/totais (ex: 3/12)" },
  { key: "{situacao}", desc: "Situação (Pendente, Pago, etc.)" },
  { key: "{vencimento}", desc: "Data de vencimento" },
  { key: "{documento}", desc: "CPF/CNPJ" },
  { key: "{whatsapp}", desc: "Número do WhatsApp" },
];
