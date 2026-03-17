import { Clock, MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer id="horarios" className="bg-primary text-primary-foreground">
      <div className="section-container py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <span className="font-display font-bold text-lg">L</span>
              </div>
              <div>
                <p className="font-display font-bold text-lg leading-tight">Lopes</p>
                <p className="text-xs opacity-70 leading-none">Saúde e Odontologia</p>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Transformando sorrisos com saúde, conforto e segurança desde 2013.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-4">Navegação</h4>
            <ul className="space-y-2 text-sm opacity-80">
              {[
                { label: "Serviços", href: "#servicos" },
                { label: "Sobre", href: "#sobre" },
                { label: "Diferenciais", href: "#diferenciais" },
                { label: "Contato", href: "#contato" },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:opacity-100 transition-opacity">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Horários */}
          <div>
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Horários
            </h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>Segunda a Sexta: 8h00 às 18h00</li>
              <li>Sábado: 8h00 às 12h00</li>
              <li>Domingo: Fechado</li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-bold mb-4">Contato</h4>
            <ul className="space-y-3 text-sm opacity-80">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5" />
                <a href="tel:+5514996684609">+55 (14) 99668-4609</a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5" />
                lopes.saude@hotmail.com
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                Av. São Paulo, 227 – Centro, Duartina - SP
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="section-container py-5 text-center text-sm opacity-60">
          Copyright © Lopes Saúde e Odontologia – Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
