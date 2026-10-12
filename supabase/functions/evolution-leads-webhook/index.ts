import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { normalizeMessage, parseIncomingMessage } from '../_shared/whatsappLead.ts';

const schema = z.object({ event: z.string().max(80), instance: z.string().max(200), data: z.union([z.record(z.unknown()), z.array(z.record(z.unknown())).max(100)]) });
const json = (body: unknown, status=200) => new Response(JSON.stringify(body), {status,headers:{...corsHeaders,'Content-Type':'application/json'}});
Deno.serve(async req => {
  if (req.method==='OPTIONS') return new Response('ok',{headers:corsHeaders});
  if (req.method!=='POST') return json({error:'Method not allowed'},405);
  const secret = Deno.env.get('EVOLUTION_WEBHOOK_SECRET');
  if (!secret || req.headers.get('x-webhook-secret')!==secret) return json({error:'Unauthorized'},401);
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return json({error:'Invalid webhook payload'},400);
    const {event,instance,data}=parsed.data;
    if (instance!==Deno.env.get('EVOLUTION_INSTANCE')) return json({error:'Unexpected instance'},400);
    if (event.toLowerCase().replace(/_/g,'.')!=='messages.upsert') return json({ignored:true});
    const url=Deno.env.get('SUPABASE_URL'), key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return json({error:'Service unavailable'},503);
    const db=createClient(url,key);
    const {data:rules,error:rulesError}=await db.from('lead_campaign_rules').select('*').eq('active',true).eq('platform','meta_ads');
    if (rulesError) throw rulesError;
    const results=[];
    for (const item of Array.isArray(data)?data:[data]) {
      const incoming=parseIncomingMessage(item);
      if (!incoming) {results.push({ignored:true});continue;}
      const normalized=normalizeMessage(incoming.text);
      const rule=(rules??[]).find(r=>r.message_match && normalizeMessage(r.message_match)===normalized);
      // A referral sourceId identifies an ad, not a campaign; never mislabel it.
      const {data:result,error}=await db.rpc('ingest_whatsapp_lead',{
        _instance:instance,_message_id:incoming.id,_phone:incoming.phone,_name:incoming.name,_message:incoming.text,
        _category:rule?.category??null,_campaign_id:rule?.campaign_key??null,_campaign_name:rule?.campaign_name??null,
        _ctwa_clid:typeof incoming.ctwa==='string'?incoming.ctwa:null,_is_meta:Boolean(rule||incoming.hasReferral),_received_at:new Date().toISOString(),
      });
      if (error) throw error;
      results.push(result);
    }
    return json({received:true,results});
  } catch (error) {
    console.error('WhatsApp ingestion failed:', error instanceof Error?error.message:'Database error');
    return json({error:'Não foi possível registrar a mensagem. A entrega poderá ser repetida.'},500);
  }
});