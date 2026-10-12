# Roadmap — Integração CRM (Google Ads + Meta Ads)

- [ ] Segurança: corrigir cinco bloqueios de acesso aos leads, históricos, logs e perfis
- [ ] Segurança: revisar integrações, credenciais e dependências; corrigir problemas confirmados
- [ ] Segurança: validar acessos permitidos/negados e executar nova varredura

- [x] Banco: colunas campanha/categoria, regras de campanha, dedup de mensagens, prioridade gclid > cookie Meta
- [x] Reclassificar leads de outubro com gclid para google_ads
- [x] Edge functions: evolution-leads-webhook (com repasse ao robô GACompany) e evolution-crm-setup
- [x] UI: filtros de plataforma/campanha/categoria no /leads, regras de campanha (admin), card de recepção no Settings
- [x] Instância correta da Evolution (port_bab9656f_n1k1u — Lopes Saúde) configurada
- [x] Webhook da instância apontado ao CRM com repasse ao robô atual (todos os 4 eventos preservados)
- [ ] Teste real: enviar mensagem ao WhatsApp da clínica com frase de campanha e confirmar lead no /leads (aguardando Gustavo)
- [ ] Verificar no Google Ads as 2 campanhas com URL final antiga (número 4609) — ajuste manual no painel do Google
