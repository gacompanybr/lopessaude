import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveLead, updateLead, type Lead, type LeadStatus, type LeadOrigem, STATUS_LABELS, ORIGEM_LABELS } from "@/lib/leads";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead?: Lead | null;
  onSaved: () => void;
}

const empty = {
  name: "",
  whatsapp: "",
  city: "",
  message: "",
  status: "novo" as LeadStatus,
  origem: "manual" as LeadOrigem,
  notes: "",
};

const LeadFormDialog = ({ open, onOpenChange, lead, onSaved }: Props) => {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name || "",
        whatsapp: lead.whatsapp,
        city: lead.city,
        message: lead.message || "",
        status: lead.status,
        origem: lead.origem,
        notes: lead.notes || "",
      });
    } else {
      setForm(empty);
    }
  }, [lead, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.whatsapp || !form.city) {
      toast.error("WhatsApp e Cidade são obrigatórios");
      return;
    }
    setSaving(true);
    try {
      if (lead) {
        await updateLead(lead.id, {
          name: form.name || null,
          whatsapp: form.whatsapp,
          city: form.city,
          message: form.message || null,
          status: form.status,
          origem: form.origem,
          notes: form.notes || null,
        });
        toast.success("Lead atualizado");
      } else {
        await saveLead({
          name: form.name || null,
          whatsapp: form.whatsapp,
          city: form.city,
          message: form.message || null,
          status: form.status,
          origem: form.origem,
          notes: form.notes || null,
        });
        toast.success("Lead cadastrado");
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar lead");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{lead ? "Editar Lead" : "Novo Lead"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="whatsapp">WhatsApp *</Label>
              <Input id="whatsapp" required value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="city">Cidade *</Label>
              <Input id="city" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as LeadStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Origem</Label>
              <Select value={form.origem} onValueChange={(v) => setForm({ ...form, origem: v as LeadOrigem })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ORIGEM_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="message">Condição odontológica</Label>
            <Textarea id="message" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="notes">Observações internas</Label>
            <Textarea id="notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadFormDialog;
