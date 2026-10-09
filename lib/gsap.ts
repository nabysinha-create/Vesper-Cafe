// Single entry point for GSAP. Import gsap, ScrollTrigger, SplitText and
// useGSAP from here (not from "gsap" directly) so plugins register once.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  // Phones resize the viewport as the address bar shows and hides; don't
  // recalculate every trigger (and jolt pinned sections) when that happens.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
