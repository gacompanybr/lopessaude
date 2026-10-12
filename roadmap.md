# Roadmap — Integração CRM (Google Ads + Meta Ads)

- [x] Segurança: corrigir cinco bloqueios de acesso aos leads, históricos, logs e perfis
- [x] Segurança: revisar integrações, remover chave Evolution do navegador e atualizar dependências vulneráveis
- [x] Segurança: validar administrador e conta sem papel, formulário público até leitura no CRM, histórico falso bloqueado e nova varredura sem bloqueios
- [ ] Segurança: substituir a chave Evolution anteriormente exposta (depende de nova chave no servidor Evolution e atualização do segredo Cloud)
- [ ] Segurança: validar assinatura dos webhooks Meta Lead Ads (depende do segredo do aplicativo Meta; não afeta webhook Evolution autenticado)

- [x] Banco: colunas campanha/categoria, regras de campanha, dedup de mensagens, prioridade gclid > cookie Meta
- [x] Reclassificar leads de outubro com gclid para google_ads
- [x] Edge functions: evolution-leads-webhook (com repasse ao robô GACompany) e evolution-crm-setup
- [x] UI: filtros de plataforma/campanha/categoria no /leads, regras de campanha (admin), card de recepção no Settings
- [x] Instância correta da Evolution (port_bab9656f_n1k1u — Lopes Saúde) configurada
- [x] Webhook da instância apontado ao CRM com repasse ao robô atual (todos os 4 eventos preservados)
- [ ] Teste real: enviar mensagem ao WhatsApp da clínica com frase de campanha e confirmar lead no /leads (aguardando Gustavo)
- [ ] Verificar no Google Ads as 2 campanhas com URL final antiga (número 4609) — ajuste manual no painel do Google
