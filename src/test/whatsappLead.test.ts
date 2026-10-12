import { describe, it, expect } from 'vitest';
import { normalizeMessage, parseIncomingMessage } from '../../supabase/functions/_shared/whatsappLead';
const incoming=(message:unknown,extra={})=>({key:{id:'test-message',remoteJid:'5514999999999@s.whatsapp.net',fromMe:false},pushName:'Teste',message,...extra});
describe('WhatsApp lead ingestion',()=>{
  it('recognizes the configured campaign despite punctuation and accents',()=>{
    expect(normalizeMessage('Olá! Posso ter mais informações sobre os tratamentos!')).toBe(normalizeMessage('Ola, posso ter mais informacoes sobre os tratamentos?'));
  });
  it('accepts received text messages',()=>{expect(parseIncomingMessage(incoming({conversation:'Quero uma consulta'}))?.phone).toBe('5514999999999');});
  it('ignores outbound messages, groups and unknown direction',()=>{
    expect(parseIncomingMessage(incoming({conversation:'Oi'},{key:{id:'1',remoteJid:'5514999999999@s.whatsapp.net',fromMe:true}}))).toBeNull();
    expect(parseIncomingMessage(incoming({conversation:'Oi'},{key:{id:'1',remoteJid:'group@g.us',fromMe:false}}))).toBeNull();
    expect(parseIncomingMessage(incoming({conversation:'Oi'},{key:{id:'1',remoteJid:'5514999999999@s.whatsapp.net'}}))).toBeNull();
  });
  it('ignores empty/media-only messages and status updates',()=>{
    expect(parseIncomingMessage(incoming({conversation:'  '}))).toBeNull();
    expect(parseIncomingMessage(incoming({imageMessage:{}}))).toBeNull();
    expect(parseIncomingMessage({status:'read'})).toBeNull();
  });
  it('reads referral metadata without mistaking an ad ID for a campaign',()=>{
    const result=parseIncomingMessage(incoming({extendedTextMessage:{text:'Oi',contextInfo:{externalAdReply:{sourceType:'ad',sourceId:'ad-123',ctwaClid:'click-123'}}}}));
    expect(result?.hasReferral).toBe(true);expect(result?.adId).toBe('ad-123');expect(result?.ctwa).toBe('click-123');
  });
});