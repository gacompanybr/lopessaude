const Footer = () => {
  return (
    <footer id="horarios" className="bg-primary text-primary-foreground">
      <div className="section-container py-12">
        <div className="grid sm:grid-cols-2 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-display font-bold text-xl">lopes</span>
              <span className="text-xs opacity-70">Saúde e Odontologia</span>
            </div>
            <p className="text-sm opacity-80 leading-relaxed max-w-md">
              Nossa missão é transformar sorrisos, promovendo saúde, bem-estar, conforto e segurança por meio de tratamentos odontológicos humanizados e programas preventivos personalizados!
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-3">Contato</h4>
            <div className="space-y-2 text-sm opacity-80">
              <p>+55 (14) 99668-4609</p>
              <p>lopes.saude@hotmail.com</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="section-container py-4 text-center text-xs opacity-50">
          Copyright © Lopes Saúde e Odontologia – Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
