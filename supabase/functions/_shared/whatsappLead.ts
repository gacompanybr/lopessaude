export function normalizeMessage(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function parseIncomingMessage(data: any) {
  const key = data?.key;
  if (!key || key.fromMe !== false || typeof key.id !== 'string') return null;
  const jid = key.remoteJid?.endsWith('@lid') ? key.remoteJidAlt : key.remoteJid;
  if (typeof jid !== 'string' || !jid.endsWith('@s.whatsapp.net')) return null;
  const phone = jid.split('@')[0].replace(/\D/g, '');
  if (!/^\d{10,15}$/.test(phone)) return null;
  const message = data.message?.ephemeralMessage?.message ?? data.message;
  const text = message?.conversation ?? message?.extendedTextMessage?.text ?? message?.imageMessage?.caption ?? message?.videoMessage?.caption;
  if (typeof text !== 'string' || !text.trim() || text.length > 10000) return null;
  const context = message?.extendedTextMessage?.contextInfo ?? message?.imageMessage?.contextInfo ?? data.contextInfo;
  const referral = context?.externalAdReply;
  return { id: key.id, phone, name: typeof data.pushName === 'string' ? data.pushName.slice(0,255) : '', text: text.trim(), ctwa: context?.ctwaClid ?? referral?.ctwaClid ?? null, adId: referral?.sourceId ?? null, hasReferral: referral?.sourceType === 'ad' || Boolean(context?.ctwaClid ?? referral?.ctwaClid) };
}