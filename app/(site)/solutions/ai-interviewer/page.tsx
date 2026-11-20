import type { Metadata } from "next";
import { Closing } from "@/components/Closing";
import { Contact } from "@/components/Contact";
import { Developers } from "@/components/Developers";
import { Enterprise } from "@/components/Enterprise";
import { Evaluation } from "@/components/Evaluation";
import { Hero } from "@/components/Hero";
import { LiveDemo } from "@/components/LiveDemo";
import { Models } from "@/components/Models";
import { Problem } from "@/components/Problem";
import { Solutions } from "@/components/Solutions";
import { Stats } from "@/components/Stats";

export const metadata: Metadata = { title: "AI Interviewer — ManavOS", description: "Structured, face-to-face first-round interviews at any volume, scored against your rubric." };

export default function Page() {
  return (
    <>
      <Hero />
      <Problem />
      <Stats />
      <Models />
      <LiveDemo />
      <Evaluation />
      <Developers />
      <Enterprise />
      <Solutions exclude="ai-interviewer" />
      <Contact />
      <Closing />
    </>
  );
}
