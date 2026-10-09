import { notFound } from "next/navigation";
import MotionPlayground from "./MotionPlayground";

// Local-only test bench for GSAP + ScrollTrigger + Lenis. Never served in
// production; the Playwright suite uses it to check the scroll setup.
export default function MotionPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <MotionPlayground />;
}
