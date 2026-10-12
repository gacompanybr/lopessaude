import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('status') }),
  z.object({ action: z.literal('connect') }),
  z.object({ action: z.literal('logout') }),
  z.object({ action: z.literal('send'), phone: z.string().regex(/^\d{10,15}$/), text: z.string().trim().min(1).max(10000) }),
]);

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL'), service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !service) return json({ error: 'Configuração incompleta' }, 503);
    const db = createClient(url, service);
    const token = req.headers.get('Authorization')?.replace(/^Bearer /, '');
    if (!token) return json({ error: 'Unauthorized' }, 401);
    const { data: { user }, error } = await db.auth.getUser(token);
    if (error || !user) return json({ error: 'Unauthorized' }, 401);
    const { data: roles, error: roleError } = await db.from('user_roles').select('role').eq('user_id', user.id);
    if (roleError || !roles?.some(r => r.role === 'admin' || r.role === 'atendente')) return json({ error: 'Forbidden' }, 403);
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return json({ error: 'Dados inválidos' }, 400);
    if (['connect', 'logout'].includes(parsed.data.action) && !roles.some(r => r.role === 'admin')) return json({ error: 'Forbidden' }, 403);
    const base = Deno.env.get('EVOLUTION_API_URL'), apiKey = Deno.env.get('EVOLUTION_API_KEY'), instance = Deno.env.get('EVOLUTION_INSTANCE');
    if (!base || !apiKey || !instance) return json({ error: 'Conexão WhatsApp não configurada' }, 503);
    const instancePath = encodeURIComponent(instance);
    const action = parsed.data.action;
    const path = action === 'status' ? `/instance/connectionState/${instancePath}` : action === 'connect' ? `/instance/connect/${instancePath}` : action === 'logout' ? `/instance/logout/${instancePath}` : `/message/sendText/${instancePath}`;
    const sendBody = parsed.data.action === 'send' ? { number: parsed.data.phone, text: parsed.data.text, textMessage: { text: parsed.data.text }, options: { delay: 800, presence: 'composing' } } : undefined;
    const response = await fetch(`${base.replace(/\/+$/, '')}${path}`, { method: action === 'logout' ? 'DELETE' : action === 'send' ? 'POST' : 'GET', headers: { apikey: apiKey, 'Content-Type': 'application/json' }, body: sendBody ? JSON.stringify(sendBody) : undefined, signal: AbortSignal.timeout(15000) });
    if (!response.ok) {
      console.error('Evolution request failed', response.status);
      return json({ error: `WhatsApp respondeu ${response.status}`, status: response.status }, response.status);
    }
    const data = await response.json();
    if (action === 'status') return json({ state: data?.instance?.state || data?.state || 'unknown', instance });
    if (action === 'connect') return json({ base64: data?.base64 || data?.qrcode?.base64, code: data?.code || data?.qrcode?.code, pairingCode: data?.pairingCode });
    return json({ success: true });
  } catch { return json({ error: 'Não foi possível concluir a operação WhatsApp' }, 502); }
});