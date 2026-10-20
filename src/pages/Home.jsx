import Hero from "../components/Hero";
import About from "../components/About";
import Services from "../components/Services";
import ServiceCategories from "../components/ServiceCategories";
import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";
import ContactCTA from "../components/ContactCTA";
export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Services />
      <ServiceCategories />
      <WhyChooseUs />
      <Testimonials />
      <ContactCTA />
    </main>
  );
}