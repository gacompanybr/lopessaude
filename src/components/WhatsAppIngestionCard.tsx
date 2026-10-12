import { useState } from 'react';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { RefreshCw, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
type Status={configured:boolean;blocked:boolean;connected:boolean;instance:string;received:number;last_received:string|null};
export default function WhatsAppIngestionCard(){
  const [status,setStatus]=useState<Status|null>(null),[busy,setBusy]=useState(false),[failure,setFailure]=useState('');
  const run=async(action:'inspect'|'activate')=>{
    setBusy(true);setFailure('');
    try{
      const {data,error}=await supabase.functions.invoke('evolution-crm-setup',{body:{action}});
      if(error){const details=error instanceof FunctionsHttpError?await error.context.json():{error:error.message};throw new Error(details.error??'Falha na integração');}
      setStatus(data);
      if(action==='activate')toast.success(data.configured?'Recepção de leads ativada':'Configuração pendente');
    }catch(e){const msg=e instanceof Error?e.message:'Falha na integração';setFailure(msg);toast.error(msg);}finally{setBusy(false);}
  };
  return <section className="border border-border rounded-xl bg-card p-5 space-y-4"><h2 className="font-display font-bold flex gap-2 items-center"><MessageCircle className="w-5 h-5 text-primary"/>Leads recebidos pelo WhatsApp</h2>
    <div className="text-sm text-muted-foreground space-y-1"><p>Recepção: {status?(status.configured?'Ativada':status.blocked?'Outra integração em uso':'Pendente'):'Não verificada'}</p>{status&&<><p>WhatsApp: {status.connected?'Conectado':'Desconectado'} · {status.instance}</p><p>Mensagens recebidas: {status.received}</p>{status.last_received&&<p>Última recepção: {new Date(status.last_received).toLocaleString('pt-BR')}</p>}</>}</div>
    {failure&&<p role="alert" className="text-sm text-destructive">{failure}</p>}
    <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={()=>run('inspect')} disabled={busy} className="gap-2"><RefreshCw className="w-4 h-4"/>Verificar recepção</Button><Button onClick={()=>run('activate')} disabled={busy||status?.blocked||status?.configured}>Ativar recepção no CRM</Button></div>
  </section>;
}