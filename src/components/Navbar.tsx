import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, MapPin, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Serviços", href: "#servicos" },
  { label: "Sobre", href: "#sobre" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Horários", href: "#horarios" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground py-1.5 text-xs">
        <div className="section-container flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            <span className="hidden sm:inline">Av. São Paulo, 227 – Centro, Duartina - SP</span>
          </div>
          <a href="tel:+5514996684609" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <Phone className="w-3 h-3" />
            (14) 99668-4609
          </a>
        </div>
      </div>

      {/* Main nav */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-200 border-b bg-background ${
          scrolled ? "shadow-sm border-border" : "border-transparent"
        }`}
      >
        <div className="section-container flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">L</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base text-foreground leading-tight">Lopes</span>
              <span className="text-[10px] text-muted-foreground leading-none">Saúde e Odontologia</span>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a href="#contato" className="btn-primary !py-2 !px-5 text-xs">
              Agendar consulta
            </a>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-foreground">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-background border-t border-border"
            >
              <div className="section-container py-3 flex flex-col gap-3">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-foreground font-medium py-1.5 text-sm"
                  >
                    {link.label}
                  </a>
                ))}
                <a href="#contato" onClick={() => setMobileOpen(false)} className="btn-primary text-center text-sm">
                  Agendar consulta
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
