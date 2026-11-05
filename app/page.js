import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Track from "@/components/Track";
import Updates from "@/components/Updates";
import Recommendations from "@/components/Recommendations";
import Franchise from "@/components/Franchise";
import Calendar from "@/components/Calendar";
import Creator from "@/components/Creator";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Track />
        <Updates />
        <Recommendations />
        <Franchise />
        <Calendar />
        <Creator />
      </main>
      <Footer />
    </>
  );
}
