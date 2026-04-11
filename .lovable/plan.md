

## Plano de melhorias: Formulario, botoes e dashboard de leads

### O que sera feito

**1. Botao "Enviar agora mesmo" (lado esquerdo do formulario, linha 73-78 do ContactForm)**
- Atualmente aponta para `#contato` (ancora para si mesmo, nao faz nada util)
- Trocar para abrir WhatsApp com mensagem generica: `https://api.whatsapp.com/send?phone=551496684609&text=Olá, gostaria de mais informações!`

**2. Bloqueio de envio quando "Particular = Nao"**
- No `handleSubmit` do ContactForm, verificar se `isParticular === "Não"`
- Se sim: nao salvar lead, nao abrir WhatsApp, exibir um toast/modal com a mensagem:
  *"Infelizmente, no momento realizamos apenas atendimentos particulares. Caso deseje prosseguir com nossa clínica, por favor reenvie o formulário selecionando 'Sim' para atendimento particular."*
- O lead so sera salvo e o WhatsApp so abrira quando `isParticular === "Sim"` (ou vazio, se preferir bloquear tambem)
- Ainda registra no localStorage que a pessoa tentou com "Nao" (para as metricas do CRM)

**3. Dashboard /leads melhorado**

Arquivos afetados: `src/pages/Leads.tsx`, `src/lib/leads.ts`

- **Filtro de data**: Adicionar dois date pickers (data inicio e data fim) para filtrar leads por periodo, usando o componente Calendar/Popover do shadcn
- **Rolagem paginada**: Colocar a lista de leads dentro de um ScrollArea com altura fixa (~500px) para nao crescer infinitamente
- **Graficos/Dashboard**: Adicionar graficos simples usando Recharts (ja compativel com shadcn):
  - **Leads por cidade**: grafico de barras horizontal com as cidades mais frequentes
  - **Leads por dia**: grafico de linha mostrando volume de leads ao longo do tempo
  - **Particular vs Nao Particular**: grafico de pizza

**Nota sobre dados demograficos**: Informacoes como sexo, faixa etaria e renda **nao podem ser obtidas automaticamente** de forma confiavel apenas com cookies ou navegador. Seria necessario adicionar campos opcionais ao formulario (ex: idade, genero) ou integrar APIs pagas de enriquecimento de dados. Nao faz sentido colocar um "aceitar cookies" para isso pois cookies nao fornecem esses dados. Recomendo adicionar campos opcionais ao formulario se quiser essas metricas.

### Resumo tecnico dos arquivos

| Arquivo | Mudanca |
|---|---|
| `src/components/ContactForm.tsx` | Botao esquerdo -> WhatsApp generico; bloqueio envio se Particular=Nao com toast |
| `src/pages/Leads.tsx` | Filtro de datas, ScrollArea, graficos com Recharts |
| `package.json` | Instalar `recharts` |

