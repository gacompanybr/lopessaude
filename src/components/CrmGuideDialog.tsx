import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. Objetivo do CRM",
    body: (
      <p>
        Centralizar o acompanhamento dos leads recebidos, permitindo registrar,
        atualizar e acompanhar cada atendimento até a conversão ou perda.
      </p>
    ),
  },
  {
    title: "2. Cadastro e origem dos leads",
    body: (
      <p>
        Os leads podem chegar pelo site, WhatsApp, redes sociais, indicação ou
        cadastro manual. É importante manter a origem correta para análise dos
        resultados das campanhas.
      </p>
    ),
  },
  {
    title: "3. Status do lead",
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Novo:</strong> lead recém-recebido, ainda sem contato.</li>
        <li><strong>Em atendimento:</strong> contato iniciado com o paciente.</li>
        <li><strong>Agendado:</strong> consulta ou avaliação marcada.</li>
        <li><strong>Convertido:</strong> paciente realizou o procedimento.</li>
        <li><strong>Perdido:</strong> lead sem interesse ou sem retorno.</li>
      </ul>
    ),
  },
  {
    title: "4. Atualização do atendimento",
    body: (
      <p>
        Sempre que houver contato com o paciente, o responsável deve atualizar o
        status, observações e próximas ações dentro do CRM.
      </p>
    ),
  },
  {
    title: "5. Boas práticas",
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Não deixar leads sem retorno.</li>
        <li>Registrar observações importantes.</li>
        <li>Atualizar o status após cada contato.</li>
        <li>Conferir telefone, cidade e interesse do paciente.</li>
        <li>Manter o histórico organizado.</li>
      </ul>
    ),
  },
  {
    title: "6. Indicadores do CRM",
    body: (
      <p>
        Os dados alimentam os indicadores da plataforma, como total de leads,
        taxa de conversão, leads por cidade, origem e status.
      </p>
    ),
  },
  {
    title: "7. Responsabilidade do usuário",
    body: (
      <p>
        Cada usuário deve manter os dados atualizados para garantir uma visão
        real da operação comercial e dos atendimentos.
      </p>
    ),
  },
];

const CrmGuideDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2">
          <HelpCircle className="w-4 h-4" /> Guia do CRM
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            POP — Utilização do CRM de Leads
          </DialogTitle>
          <DialogDescription>
            Procedimento Operacional Padrão para o uso correto do CRM da Lopes
            Saúde.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-5 text-sm text-foreground leading-relaxed">
            {SECTIONS.map((s) => (
              <section key={s.title}>
                <h3 className="font-display font-semibold text-base mb-1.5">
                  {s.title}
                </h3>
                <div className="text-muted-foreground">{s.body}</div>
              </section>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CrmGuideDialog;
