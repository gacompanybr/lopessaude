import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import AlinhadorFeature from "@/components/AlinhadorFeature";
import About from "@/components/About";
import Differentials from "@/components/Differentials";
import Testimonials from "@/components/Testimonials";
import FinalCTA from "@/components/FinalCTA";
import ContactForm from "@/components/ContactForm";
import LocationContact from "@/components/LocationContact";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <AlinhadorFeature />
        <About />
        <Differentials />
        <Testimonials />
        <FinalCTA />
        <ContactForm />
        <LocationContact />
        <FAQ />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
