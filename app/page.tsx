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
import SmoothScroll from "@/components/SmoothScroll";
import HomeChoreography from "@/components/motion/HomeChoreography";

export default function Home() {
  return (
    <SmoothScroll>
      <Nav />
      <main className="pb-14 md:pb-0">
        <Hero />
        {/* Everything after the hero sits above it, so it can slide over the pinned film. */}
        <div className="relative z-10">
          <Philosophy />
          <Signature />
          <Ritual />
          <Experience />
          <Bakery />
          <DayJourney />
          <Visit />
          <SocialStrip />
        </div>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
      <HomeChoreography />
    </SmoothScroll>
  );
}
