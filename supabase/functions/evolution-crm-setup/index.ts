import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders,'Content-Type':'application/json'}});
Deno.serve(async req=>{
  if(req.method==='OPTIONS') return new Response('ok',{headers:corsHeaders});
  if(req.method!=='POST') return json({error:'Method not allowed'},405);
  try {
    const url=Deno.env.get('SUPABASE_URL'),service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const base=Deno.env.get('EVOLUTION_API_URL'),apiKey=Deno.env.get('EVOLUTION_API_KEY'),instance=Deno.env.get('EVOLUTION_INSTANCE'),secret=Deno.env.get('EVOLUTION_WEBHOOK_SECRET');
    if(!url||!service||!base||!apiKey||!instance||!secret) return json({error:'Configuração da integração incompleta'},503);
    const db=createClient(url,service);
    const bearer=req.headers.get('Authorization')?.replace(/^Bearer /,'');
    if(!bearer) return json({error:'Unauthorized'},401);
    const {data:{user}}=await db.auth.getUser(bearer);
    if(!user) return json({error:'Unauthorized'},401);
    const {data:admin}=await db.rpc('has_role',{_user_id:user.id,_role:'admin'});
    if(!admin) return json({error:'Forbidden'},403);
    const parsed=z.object({action:z.enum(['inspect','activate']),force:z.boolean().optional()}).safeParse(await req.json());
    if(!parsed.success) return json({error:'Invalid action'},400);
    const call=async(path:string,body?:unknown)=>{
      const response=await fetch(`${base.replace(/\/$/,'')}${path}`,{method:body?'POST':'GET',headers:{apikey:apiKey,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});
      const text=await response.text();
      if(!response.ok){
        // Avoid returning provider tokens or webhook secrets in diagnostics.
        console.error('Evolution failed',response.status);
        throw new Error(`Evolution respondeu ${response.status}. Verifique o acesso e a instância configurada.`);
      }
      return text?JSON.parse(text):{};
    };
    const current=await call(`/webhook/find/${encodeURIComponent(instance)}`);
    const hook=current?.webhook??current;
    const target=`${url}/functions/v1/evolution-leads-webhook`;
    const occupied=Boolean(hook?.enabled&&hook?.url&&hook.url!==target);
    if(parsed.data.action==='activate'){
      if(occupied) return json({error:'Esta instância já envia mensagens para outra integração. Ela foi preservada; encaminhe também os eventos ao CRM pela integração existente.',blocked:true},409);
      await call(`/webhook/set/${encodeURIComponent(instance)}`,{webhook:{enabled:true,url:target,webhookByEvents:false,webhookBase64:false,headers:{'x-webhook-secret':secret},events:['MESSAGES_UPSERT']}});
    }
    const verified=parsed.data.action==='activate'?await call(`/webhook/find/${encodeURIComponent(instance)}`):current;
    const v=verified?.webhook??verified;
    const state=await call(`/instance/connectionState/${encodeURIComponent(instance)}`);
    const {count}=await db.from('whatsapp_ingestion_events').select('*',{count:'exact',head:true});
    const {data:last}=await db.from('whatsapp_ingestion_events').select('received_at').order('received_at',{ascending:false}).limit(1);
    return json({configured:Boolean(v?.enabled&&v?.url===target),blocked:occupied,connected:(state?.instance?.state??state?.state)==='open',instance,received:count??0,last_received:last?.[0]?.received_at??null});
  }catch(error){return json({error:error instanceof Error?error.message:'Falha ao verificar a Evolution'},502);}
});