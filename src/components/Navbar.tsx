import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, MapPin, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Serviços", href: "#servicos" },
  { label: "Sobre", href: "#sobre" },
  { label: "Horários", href: "#horarios" },
  { label: "Diferenciais", href: "#diferenciais" },
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
      <div className="border-b border-border py-2.5">
        <div className="section-container flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Av. São Paulo, 227 – Centro, Duartina - SP</span>
          </div>
          <a href="tel:+5514996684609" className="flex items-center gap-2 hover:text-primary transition-colors">
            <Phone className="w-4 h-4 text-primary" />
            +55 (14)99668-4609
          </a>
        </div>
      </div>

      {/* Main nav */}
      <nav
        className={`sticky top-0 z-50 bg-card transition-shadow duration-200 ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="section-container flex items-center justify-between h-20">
          <a href="#" className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" className="text-primary">
                <path d="M20 4C11.16 4 4 11.16 4 20s7.16 16 16 16 16-7.16 16-16S28.84 4 20 4zm-2 24h-4v-4h4v4zm0-6h-4V10h4v12zm8 6h-4v-4h4v4zm0-6h-4V10h4v12z" fill="currentColor" opacity="0.15"/>
                <path d="M20 8v10h-6v-2h4V8h2zm2 0v8h4v2h-6V8h2z" fill="currentColor"/>
                <rect x="16" y="22" width="8" height="2" rx="1" fill="currentColor"/>
              </svg>
              <span className="font-display font-bold text-2xl text-primary tracking-tight">lopes</span>
            </div>
            <div className="flex flex-col ml-0.5">
              <span className="text-[9px] text-muted-foreground leading-none uppercase tracking-widest">Saúde e</span>
              <span className="text-[9px] text-muted-foreground leading-none uppercase tracking-widest">Odontologia</span>
            </div>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-foreground font-semibold text-sm hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contato"
              className="bg-primary text-primary-foreground px-7 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Contato
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
              className="md:hidden overflow-hidden bg-card border-t border-border"
            >
              <div className="section-container py-4 flex flex-col gap-3">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-foreground font-semibold py-2 text-sm"
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="#contato"
                  onClick={() => setMobileOpen(false)}
                  className="bg-primary text-primary-foreground text-center py-2.5 rounded-full text-sm font-semibold"
                >
                  Contato
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
