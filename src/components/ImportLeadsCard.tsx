import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Download, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { importLeadsFromFile, downloadLeadsTemplate, type ImportResult } from "@/lib/importLeads";

interface Props {
  onImported?: () => void;
}

const ImportLeadsCard = ({ onImported }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [lastResult, setLastResult] = useState<ImportResult | null>(null);

  const handlePick = (f: File | undefined | null) => {
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext || "")) {
      toast.error("Formato inválido. Use .xlsx ou .csv");
      return;
    }
    setFile(f);
    setLastResult(null);
  };

  const handleImport = async () => {
    if (!file) {
      toast.info("Selecione um arquivo primeiro");
      return;
    }
    setImporting(true);
    try {
      const res = await importLeadsFromFile(file);
      setLastResult(res);
      if (res.inserted > 0) {
        toast.success(`${res.inserted} lead(s) importado(s) com sucesso`);
        onImported?.();
      } else if (res.duplicates > 0 && res.errors.length === 0) {
        toast.info("Nenhum novo lead. Todos já estavam cadastrados.");
      } else {
        toast.warning("Nenhum lead foi importado. Verifique os erros.");
      }
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (e: any) {
      toast.error(e?.message || "Erro ao importar planilha");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          <div>
            <h2 className="font-display font-bold text-foreground text-base">Importar planilha</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Envie um arquivo .xlsx ou .csv com os leads. Telefones já cadastrados serão ignorados.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={downloadLeadsTemplate} className="gap-2">
          <Download className="w-4 h-4" /> Baixar modelo
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => handlePick(e.target.files?.[0])}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={importing}
          className="gap-2"
        >
          <Upload className="w-4 h-4" /> Selecionar arquivo
        </Button>

        {file && (
          <div className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
            <FileSpreadsheet className="w-4 h-4 text-primary" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{file.name}</span>
            <button
              onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ""; }}
              className="text-muted-foreground hover:text-destructive"
              disabled={importing}
              aria-label="Remover arquivo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <Button onClick={handleImport} size="sm" disabled={!file || importing} className="gap-2">
          {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {importing ? "Importando..." : "Importar"}
        </Button>

        <span className="text-xs text-muted-foreground ml-auto">
          Campos: <strong>nome, whatsapp, cidade, origem, status, mensagem, notas</strong>
        </span>
      </div>

      {lastResult && (
        <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg border border-border bg-green-50 dark:bg-green-950/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Importados</p>
            <p className="font-display font-bold text-green-700 dark:text-green-400 text-lg">{lastResult.inserted}</p>
          </div>
          <div className="rounded-lg border border-border bg-yellow-50 dark:bg-yellow-950/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Duplicados ignorados</p>
            <p className="font-display font-bold text-yellow-700 dark:text-yellow-400 text-lg">{lastResult.duplicates}</p>
          </div>
          <div className="rounded-lg border border-border bg-red-50 dark:bg-red-950/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Erros</p>
            <p className="font-display font-bold text-red-700 dark:text-red-400 text-lg">{lastResult.errors.length}</p>
          </div>
          {lastResult.errors.length > 0 && (
            <div className="sm:col-span-3 rounded-lg border border-border bg-muted/30 px-3 py-2 max-h-32 overflow-auto">
              <p className="text-xs font-semibold text-foreground mb-1">Detalhes dos erros:</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {lastResult.errors.slice(0, 20).map((e, i) => (
                  <li key={i}>• Linha {e.row}: {e.reason}</li>
                ))}
                {lastResult.errors.length > 20 && (
                  <li className="italic">... e mais {lastResult.errors.length - 20} erro(s)</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportLeadsCard;
