import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Philosophy from "@/components/Philosophy";
import Signature from "@/components/Signature";
import Ritual from "@/components/Ritual";
import Experience from "@/components/Experience";
import Bakery from "@/components/Bakery";
import DayJourney from "@/components/DayJourney";
import Visit from "@/components/Visit";
import SocialStrip from "@/components/SocialStrip";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="pb-14 md:pb-0">
        <Hero />
        <Philosophy />
        <Signature />
        <Ritual />
        <Experience />
        <Bakery />
        <DayJourney />
        <Visit />
        <SocialStrip />
      </main>
      <Footer />
    </>
  );
}
