import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings2, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { CATEGORY_LABELS } from "@/lib/leads";

export default function CampaignRulesDialog({ onSaved }: { onSaved: () => void }) {
  const [open,setOpen]=useState(false);
  const [rules,setRules]=useState<Array<{id:string;platform:string;campaign_key:string;campaign_name:string;category:string;message_match:string|null}>>([]);
  const [platform,setPlatform]=useState("google_ads"), [key,setKey]=useState(""), [name,setName]=useState(""), [category,setCategory]=useState("clinica"), [message,setMessage]=useState("");
  const [saving,setSaving]=useState(false);
  const load=async()=>{const {data,error}=await supabase.from('lead_campaign_rules').select('*').order('campaign_name');if(error)toast.error(error.message);else setRules(data??[]);};
  useEffect(()=>{if(open) void load();},[open]);
  const save=async()=>{
    if(!key.trim()||!name.trim())return toast.error('Informe identificação e nome da campanha');
    setSaving(true);
    const {error}=await supabase.from('lead_campaign_rules').upsert({platform,campaign_key:key.trim(),campaign_name:name.trim(),category,message_match:message.trim()||null},{onConflict:'platform,campaign_key'});
    setSaving(false);
    if(error)return toast.error(error.message);
    toast.success('Regra salva');setKey('');setName('');setMessage('');await load();onSaved();
  };
  const remove=async(id:string)=>{if(!confirm('Excluir esta regra de campanha?'))return;const {error}=await supabase.from('lead_campaign_rules').delete().eq('id',id);if(error)toast.error(error.message);else{await load();onSaved();}};
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="outline" size="sm" className="gap-2"><Settings2 className="h-4 w-4"/>Regras de campanhas</Button></DialogTrigger>
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>Campanhas e categorias</DialogTitle></DialogHeader>
      <div className="divide-y divide-border">{rules.map(r=><div key={r.id} className="py-3 flex items-center justify-between gap-3"><div className="min-w-0"><p className="font-medium break-words">{r.campaign_name}</p><p className="text-xs text-muted-foreground break-words">{r.platform==='google_ads'?'Google Ads':'Meta Ads'} · {r.campaign_key} · {CATEGORY_LABELS[r.category]??r.category}</p></div><div className="flex shrink-0"><Button variant="ghost" size="sm" onClick={()=>{setPlatform(r.platform);setKey(r.campaign_key);setName(r.campaign_name);setCategory(r.category);setMessage(r.message_match??'');}}>Editar</Button><Button variant="ghost" size="icon" aria-label={`Excluir regra ${r.campaign_name}`} onClick={()=>remove(r.id)}><Trash2 className="w-4 h-4"/></Button></div></div>)}</div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Plataforma</Label><Select value={platform} onValueChange={setPlatform}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="google_ads">Google Ads</SelectItem><SelectItem value="meta_ads">Meta Ads</SelectItem></SelectContent></Select></div>
        <div className="space-y-1"><Label>Categoria</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{Object.entries(CATEGORY_LABELS).map(([k,v])=><SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1"><Label htmlFor="campaign-key">ID ou identificação da campanha</Label><Input id="campaign-key" value={key} onChange={e=>setKey(e.target.value)}/></div>
        <div className="space-y-1"><Label htmlFor="campaign-name">Nome da campanha</Label><Input id="campaign-name" value={name} onChange={e=>setName(e.target.value)}/></div>
        {platform==='meta_ads'&&<div className="sm:col-span-2 space-y-1"><Label htmlFor="campaign-message">Mensagem inicial da campanha</Label><Input id="campaign-message" value={message} onChange={e=>setMessage(e.target.value)}/></div>}
      </div><Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4"/>{saving?'Salvando…':'Salvar regra'}</Button>
    </DialogContent></Dialog>;
}