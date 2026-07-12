"use client";

import { GlowButton, type GlowButtonProps } from "@/components/ui/glow";
import { ArrowRight } from "lucide-react";

type GlowButtonDemoProps = Pick<
  GlowButtonProps,
  "mode" | "blur" | "duration" | "glowScale"
>;

export const GlowButtonDemo = ({
  mode = "colorShift",
  blur = "medium",
  duration = 3,
  glowScale = 1.1,
}: GlowButtonDemoProps) => {
  return (
    <div className="flex min-h-[240px] flex-wrap items-center justify-center gap-6 p-10 bg-slate-900 rounded-xl my-8">
      <GlowButton
        mode={mode}
        blur={blur}
        duration={duration}
        glowScale={glowScale}
        colors={["#FF5733", "#33FF57", "#3357FF", "#F1C40F", "#FF5733"]}
        className="rounded-full px-8 py-6 text-lg font-bold bg-black text-white hover:bg-black/80 border border-white/10"
        wrapperClassName="rounded-full"
      >
        Explore Features
        <ArrowRight className="ml-2 h-5 w-5" />
      </GlowButton>
    </div>
  );
};

export default GlowButtonDemo;
