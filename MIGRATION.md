# MIGRATION.md — Diagnóstico de Migração (Lopes Saúde)

Diagnóstico gerado em 28/10/2026 para migração deste projeto para outro servidor.
Nenhum dado de clientes, senha, token ou chave privada está incluído neste arquivo.

---

## 1. Tipo do projeto e stack

- **Tipo:** site institucional (landing page de clínica odontológica) + CRM interno de leads (`/leads`) com autenticação, banco de dados, storage e edge functions.
- **Framework:** React 18 + Vite 5 + TypeScript 5, Tailwind CSS v3, shadcn/ui (Radix), React Router 7, TanStack Query.
- **Node:** v22.23.4 (ambiente atual).
- **Gerenciador de pacotes:** Bun (há `bun.lock`/`bun.lockb`; também existe `package-lock.json`, então npm funciona).

## 2. Comandos

```bash
bun install        # ou npm install
bun run dev        # desenvolvimento (Vite)
bun run build      # build de produção (saída em dist/)
bun run preview    # servir o build localmente
bun run test       # testes (vitest)
```

## 3. Banco de dados

Backend: **Lovable Cloud** (Supabase gerenciado pela plataforma).
Project ID (ref): `kjpmtzicgftrzygawpox`.

Tabelas (schema `public`) e contagem de linhas:

| Tabela | Linhas |
|---|---|
| leads | 203 |
| profiles | 4 |
| user_roles | 3 |
| lead_campaign_rules | 2 |
| lead_status_history | 19 |
| lead_origem_history | 394 |
| meta_integration_logs | 25 |
| meta_webhook_subscriptions | 0 |
| profile_types | 2 |
| user_profile_assignments | 3 |
| whatsapp_ingestion_events | 0 |
| company_settings | 1 |

Enums: `app_role`, `lead_origem`, `lead_status`, `lead_tag_origem`, `profile_category`.

Funções/triggers relevantes no banco: `has_role`, `has_crm_access`, `create_public_lead`, `ingest_whatsapp_lead`, `get_email_by_username`, `classify_lead_tag_origem`, `assign_lead_campaign`, `reapply_lead_campaign_rules`, `log_lead_tag_origem_change`, `handle_new_user`, `update_updated_at_column`. Todas as tabelas têm RLS habilitado com políticas baseadas em papéis (admin/atendente).

## 4. Autenticação

- **Supabase Auth padrão** (e-mail/senha), com login também por nome de usuário (via RPC `get_email_by_username`).
- Papéis em `public.user_roles` (admin / atendente); perfis em `public.profiles`.
- **Usuários cadastrados:** 4.

## 5. Storage

| Bucket | Público | Arquivos |
|---|---|---|
| company-assets | sim | 1 |

## 6. Edge Functions (Supabase Functions)

| Função | O que faz |
|---|---|
| admin-create-user | Cria usuários do CRM (somente admin). |
| admin-update-user | Edita e-mail, username e senha de usuários (somente admin). |
| admin-delete-user | Remove usuários do CRM (somente admin). |
| evolution-crm-setup | Inspeciona/ativa o webhook da instância Evolution apontando para este backend. |
| evolution-dispatch | Proxy server-only para a Evolution API (status, conectar/QR, logout, envio de mensagens); ações em allowlist, exige papel admin/atendente. |
| evolution-leads-webhook | Recebe mensagens WhatsApp da Evolution (com segredo no header), deduplica, cria/atualiza leads e repassa ao robô externo (GACompany). |
| meta-ads-insights | Consulta métricas do Meta Ads. |
| meta-leads-webhook | Recebe leads do Meta Lead Ads (verificação de webhook + ingestão). |
| meta-send-event | Envia eventos de conversão (CAPI) ao Meta quando o status do lead muda. |
| _shared | Código compartilhado entre as functions (não é endpoint). |

## 7. Secrets (somente nomes)

Configurados no backend (Lovable Cloud / Supabase):

| Nome | Serviço |
|---|---|
| EVOLUTION_API_URL | Evolution API (WhatsApp) |
| EVOLUTION_API_KEY | Evolution API (WhatsApp) |
| EVOLUTION_INSTANCE | Evolution API (WhatsApp) |
| EVOLUTION_WEBHOOK_SECRET | Evolution API (WhatsApp) |
| EVOLUTION_FORWARD_URL | Robô externo GACompany (repasse de webhook) |
| META_ACCESS_TOKEN | Meta (Facebook/Instagram) |
| META_DATASET_ID | Meta Pixel / Conversions API |
| META_WEBHOOK_VERIFY_TOKEN | Meta Webhooks |
| GOOGLE_SEARCH_CONSOLE_API_KEY | Google Search Console (conector) |
| LOVABLE_API_KEY | Plataforma Lovable (gateway) |
| SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_PUBLISHABLE_KEYS, SUPABASE_SECRET_KEYS, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_URL, SUPABASE_JWKS | Gerenciados automaticamente pelo Lovable Cloud |

## 8. Integrações externas

- **WhatsApp — Evolution API** (`evo.gacompany.online`): recebimento de leads via webhook e disparo de mensagens (limite de 6/hora na UI). Instância atual: `port_bab9656f_n1k1u`.
- **Robô GACompany:** webhook externo que recebe repasse de todas as mensagens (`EVOLUTION_FORWARD_URL`).
- **Meta (Facebook):** Pixel `4618957974838971` no front-end; Conversions API via `meta-send-event`; Lead Ads via `meta-leads-webhook`.
- **Google Ads:** rastreamento via GTM (`GTM-57TM4N93`) + captura de `gclid`/UTMs nos leads; sem tag de conversão direta no código.
- **Google Search Console:** conector configurado (verificação de domínio).
- **IA:** nenhuma funcionalidade de IA em uso; o gateway de IA da Lovable não é utilizado pelo app.

## 9. Variáveis de ambiente do front-end (somente nomes)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

(Definidas no `.env`, que é gerado automaticamente pela plataforma.)

## 10. Dependências da plataforma Lovable (o que quebraria fora dela)

1. **Lovable Cloud / Supabase gerenciado:** banco, auth, storage e edge functions rodam na infraestrutura gerenciada. Fora da plataforma é preciso provisionar um projeto Supabase (ou equivalente) e recriar: tabelas + enums + RLS + triggers + funções RPC, usuários de auth, buckets e secrets.
2. **`.env` auto-gerado:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` e `VITE_SUPABASE_PROJECT_ID` são injetados pela plataforma; em outro servidor devem ser criados manualmente.
3. **`src/integrations/supabase/client.ts`:** arquivo auto-gerado que lê essas variáveis.
4. **Secrets do backend:** são gerenciados pelo painel Lovable Cloud; em outra infraestrutura precisam ser recadastrados um a um (lista na seção 7).
5. **Edge functions:** usam Deno (Supabase Functions). Fora do Supabase, precisam de adaptação.
6. **Preview/deploy:** o domínio `lopessaude.lovable.app` e o domínio customizado `lopessaude.com.br` são servidos pela plataforma; migração exige novo apontamento de DNS.
7. **Conector Google Search Console:** configurado via painel de conectores da Lovable.
8. **Pacote `@lovable.dev/cloud-auth-js`:** dependência específica da plataforma usada na autenticação do preview.

## 11. Checklist resumido para migrar

1. Criar projeto Supabase (ou Postgres + Auth + Storage + Functions equivalentes).
2. Aplicar o schema: tabelas, enums, RLS, triggers e funções RPC listados na seção 3.
3. Recriar os 4 usuários de auth e seus papéis em `user_roles`.
4. Recriar o bucket `company-assets` (público) e subir o arquivo existente.
5. Implantar as 9 edge functions e cadastrar todos os secrets da seção 7.
6. Definir as 3 variáveis `VITE_*` no novo ambiente de build.
7. Repontar o webhook da instância Evolution para a nova URL da função `evolution-leads-webhook`.
8. Repontar o webhook de Lead Ads no painel do Meta para a nova URL de `meta-leads-webhook`.
9. Atualizar o DNS de `lopessaude.com.br` para o novo servidor.
10. Exportar/importar os dados das tabelas (especialmente `leads` e históricos) — fora do escopo deste arquivo.

---

## 12. Valores

- `VITE_SUPABASE_URL`: `https://kjpmtzicgftrzygawpox.supabase.co` (valor público, visível no `.env`)
- `VITE_SUPABASE_PROJECT_ID`: `kjpmtzicgftrzygawpox` (valor público, visível no `.env`)
- `VITE_SUPABASE_PUBLISHABLE_KEY`: chave pública/anon (visível no `.env`; por ser uma chave pública não é segredo, mas foi omitida deste documento por precaução)
- Demais secrets (EVOLUTION_*, META_*, SUPABASE_SERVICE_ROLE_KEY, etc.): **valor não acessível** — ficam ocultos no painel do Lovable Cloud e devem ser obtidos diretamente com cada provedor (Evolution, Meta, Google) na hora da migração.
