// Single entry point for GSAP. Import gsap, ScrollTrigger and useGSAP from
// here (not from "gsap" directly) so plugins are registered exactly once.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };
