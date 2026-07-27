import { useState, useEffect } from "react";
import logoLopes from "@/assets/logo-lopes.jpg";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, MapPin, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Serviços", href: "#servicos" },
  { label: "Sobre", href: "#sobre" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Localização", href: "#localizacao" },
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
          <a
            href="https://www.google.com/maps/place/Dra.+Karen+Lopes+-+Dentista+-+Bauru-SP/@-22.3303687,-49.2437992,11z/data=!3m1!4b1!4m6!3m5!1s0x94bf67a8714f8569:0x722278f7ec621d79!8m2!3d-22.3307696!4d-49.0789851!16s%2Fg%2F11hfpqqjg1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <MapPin className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Bauru - SP</span>
          </a>
          <a href="tel:+5514998805438" className="flex items-center gap-2 hover:text-primary transition-colors">
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
            <img src={logoLopes} alt="Lopes Saúde e Odontologia" className="h-12 object-contain" />
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

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-foreground"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
          >
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
